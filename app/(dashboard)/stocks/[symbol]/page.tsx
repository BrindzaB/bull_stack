import StockQuoteCard from "@/components/stock/StockQuoteCard";
import StockChart from "@/components/stock/StockChart";
import StockNewsFeed from "@/components/stock/StockNewsFeed";
import AddToWatchlistButton from "@/components/watchlist/AddToWatchlistButton";

interface PageProps {
    params: { symbol: string};
}

export default function StockPage({params}: PageProps) {
    const symbol = params.symbol.toUpperCase();

    return (
        <div className="h-full flex flex-col gap-3">
            <div className="flex items-center justify-start">
                <AddToWatchlistButton symbol={symbol}/>
            </div>
            <div className="grid grid-cols-1 gap-3 flex-1 min-h-0 lg:grid-cols-[1fr_380px] lg:grid-rows-1">
                <div className="flex flex-col gap-3 h-full">
                    <StockQuoteCard symbol={symbol}/>
                    <div className="flex-1 min-h-0">
                        <StockChart symbol={symbol} />
                    </div>
                </div>
                <div className="h-full min-h-0">
                    <StockNewsFeed symbol={symbol} />
                </div>
            </div>
        </div>
    );
}
