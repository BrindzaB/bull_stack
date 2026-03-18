import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
 

export async function GET() {

    const session = await auth();
    if (!session) return new Response("Unauthorized", {status: 401});

    const favorites = await prisma.favoriteStock.findMany({where: { userId: session.user.id}})
    return Response.json(favorites);

}

export async function POST(request: Request) {
    const session = await auth();
    if (!session) return new Response("Unauthorized", {status: 401});

    const { symbol } = await request.json();
    if (!symbol) return new Response("Bad request", { status: 400});

    try {
        const record = await prisma.favoriteStock.create({data: {userId: session.user.id, symbol: symbol}})
        return Response.json(record, {status: 201});
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
            return new Response("Already in watchlist", {status: 409});
        return new Response("Internal server error", {status: 500});
    }

}
