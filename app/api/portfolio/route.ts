import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getQuote } from "@/lib/finnhub";

async function getOrCreatePortfolio(userId: string) {
    const existing = await prisma.portfolio.findFirst({where: {userId}});
    if (existing) return existing;
    return prisma.portfolio.create({data: {userId, name: "My Portfolio"}});
}

// GET /api/portfolio
// Returns all holdings enriched with live prices and computed P&L.
export async function GET() {
    const session = await auth();
    if (!session) return new Response("Unauthorized", {status: 401});

    const portfolio = await prisma.portfolio.findFirst({
        where: {userId: session.user.id},
        include: { holdings: true},
    });

    if (!portfolio || portfolio.holdings.length === 0) {
        return Response.json({
            holdings: [],
            summary: {totalValue: 0, totalCost: 0, totalPnL: 0, totalPnLPercent: 0},
        });
    }

    // Batch-fetch live prices for every symbol in parallel
    // .catch(() => null) means one failed quote won't crash the whole response
    const symbols = portfolio.holdings.map((h) => h.symbol);
    const quotes = await Promise.all(symbols.map((s) => getQuote(s).catch(() => null)));

    const holdings = portfolio.holdings.map((holding, i) => {
        const currentPrice = quotes[i]?.c ?? 0; // FinnhubQuote.c = current price
        const quantity = Number(holding.quantity);
        const averageCost = Number(holding.averageCost);
        const currentValue = quantity * currentPrice;
        const costBasis = quantity * averageCost;
        const pnl = currentValue - costBasis;
        const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

        return {
            id: holding.id,
            symbol: holding.symbol,
            quantity,
            averageCost,
            currentPrice,
            currentValue,
            costBasis,
            pnl,
            pnlPercent
        };
    });

    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalCost = holdings.reduce((sum, h) => sum + h.costBasis, 0);
    const totalPnL = totalValue - totalCost;
    const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

    return Response.json({
        holdings,
        summary: {totalValue, totalCost, totalPnL, totalPnLPercent},
    });
}

// POST /api/portfolio
// Adds a BUY transaction

export async function POST(request: Request) {
    const session = await auth();
    if (!session) return new Response("Unauthorized", {status: 401});

    const { symbol, quantity, price, date } = await request.json();

    if (!symbol || !quantity || !price || !date) {
        return new Response("Bad request", {status: 400});
    }

    const portfolio = await getOrCreatePortfolio(session.user.id);

    const existing = await prisma.portfolioHolding.findUnique({
        where: { portfolioId_symbol: { portfolioId: portfolio.id, symbol}}
    });

    let holding;

    if (existing) {
        const oldQty = Number(existing.quantity);
        const oldAvg = Number(existing.averageCost);
        const addedQty = Number(quantity);
        const addedPrice = Number(price);
        const newQty = oldQty + addedQty;
        const newAvgCost = (oldQty * oldAvg + addedQty * addedPrice) / newQty;

        holding = await prisma.portfolioHolding.update({
            where: { id: existing.id },
            data: {
                quantity: newQty,
                averageCost: newAvgCost,
                transactions: {
                    create: {type: "BUY", quantity: addedQty, price: addedPrice, date: new Date(date)}
                },
            },
        });
    } else {
        holding = await prisma.portfolioHolding.create({
            data: {
                portfolioId: portfolio.id,
                symbol,
                quantity: Number(quantity),
                averageCost: Number(price),
                transactions: {
                    create: { type: "BUY", quantity: Number(quantity), price: Number(price), date: new Date(date)},
                },
            },
        });
    }

    return Response.json(holding, {status: 201});
}