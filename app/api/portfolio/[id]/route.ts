import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/portfolio/[id]
export async function DELETE(_req: Request, {params}: {params: {id: string}}) {
    const session = await auth();
    if (!session) return new Response("Unauthorized", {status: 401});

    const holding = await prisma.portfolioHolding.findFirst({
        where: {
            id: params.id,
            portfolio: { userId: session.user.id }
        }
    });

    if (!holding) return new Response("Not found", {status: 404});

    await prisma.portfolioHolding.delete({where: {id: params.id}});

    return new Response(null, { status: 204});
}

// PUT /api/portfolio/[id]
export async function PUT(request: Request, {params}: {params: {id: string}}) {
    const session = await auth();
    if (!session) return new Response("Unauthorized", {status: 401});

    const { quantity, averageCost } = await request.json();

    const holding = await prisma.portfolioHolding.findFirst({
        where: {
            id: params.id,
            portfolio: {userId: session.user.id}
        },
    });

    if (!holding) return new Response("Not found", {status: 404});

    const updated = await prisma.portfolioHolding.update({
        where: {id: params.id},
        data: {quantity, averageCost},
    });

    return Response.json(updated);
}