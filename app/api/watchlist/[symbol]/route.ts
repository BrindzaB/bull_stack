import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request, {params}: {params: {symbol: string}}) {
    const session = await auth();
    if (!session) return new Response("Unauthorized", {status: 401});

    const symbol = params.symbol;
    if (!symbol) return new Response("Bad request", {status: 400});

    const result = await prisma.favoriteStock.deleteMany({where: {userId: session.user.id, symbol: symbol}});
    if (result.count === 0) return new Response("Not found", { status: 404});
    return new Response("Delete successful", {status:204});
    
}