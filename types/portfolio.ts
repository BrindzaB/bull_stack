export interface HoldingWithPnL {
    id: string;
    symbol: string;
    quantity: number;
    averageCost: number;
    currentPrice: number;
    currentValue: number;
    costBasis: number;
    pnl: number;
    pnlPercent: number;
}

export interface PortfolioResponse {
    holdings: HoldingWithPnL[];
    summary: {
        totalValue: number;
        totalCost: number;
        totalPnL: number;
        totalPnLPercent: number;
    };
}

