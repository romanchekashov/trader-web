import * as React from "react";
import {useEffect, useState} from "react";
import {FixedSizeList as List} from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import "./BotControlLastInfo.css";
import {WebsocketService, WSEvent} from "../../../common/api/WebsocketService";
import {TradingStrategyResult} from "../../../common/data/history/TradingStrategyResult";
import {adjustTradingStrategyResultArray} from "../../../common/utils/DataUtils";

type Props = {
    onStrategyResultSelected: (result: TradingStrategyResult) => void
    onSelectedTSResultUpdate: (result: TradingStrategyResult) => void
    outerHeight?: number
};

export const BotControlRunningStrategies: React.FC<Props> =
    ({onStrategyResultSelected, onSelectedTSResultUpdate, outerHeight}) => {

    const [results, setResults] = useState<TradingStrategyResult[]>([]);
    const [selectedResult, setSelectedResult] = useState<TradingStrategyResult>(null);

    useEffect(() => {
        const wsStatusSub = WebsocketService.getInstance()
            .connectionStatus()
            .subscribe(isConnected => {
                if (isConnected) {
                    // informServerAboutRequiredData();
                }
            });

        const tradingStrategiesStatesSubscription = WebsocketService.getInstance()
            .on<TradingStrategyResult[]>(WSEvent.TRADING_STRATEGIES_RESULTS)
            .subscribe(data => {
                const results = adjustTradingStrategyResultArray(data)
                setResults(results);
                if (selectedResult != null) {
                    for (const result of results) {
                        if (selectedResult.tradingStrategyData.id === result.tradingStrategyData.id) {
                            setSelectedResult(result);
                            onSelectedTSResultUpdate(result);
                        }
                    }
                }
            });

        // Specify how to clean up after this effect:
        return function cleanup() {
            if (wsStatusSub) wsStatusSub.unsubscribe();
            if (tradingStrategiesStatesSubscription) tradingStrategiesStatesSubscription.unsubscribe();
        };
    }, []);

    if (results.length === 0) {
        return (
            <div className="p-grid">
                <div className="p-col-12">
                    No Running Trading Strategy Bots
                </div>
            </div>
        );
    }

    const Row = ({index, style}) => {
        const result: TradingStrategyResult = results[index];
        let className = index % 2 ? "bot-control-last-info-row-odd " : "bot-control-last-info-row-even ";
        className += (selectedResult === result ? "row-selected" : "");

        return (
            <div className={className}
                 style={style}
                 key={result.tradingStrategyData.id}
                 onClick={() => {
                     setSelectedResult(result);
                     onStrategyResultSelected(result);
                 }}>
                <div>
                    {result.tradingStrategyData.name}-{result.tradingStrategyData.id}-{result.tradingStrategyData.interval}
                </div>
                <div>
                    {result.tradingStrategyData.security.code}-{result.tradingStrategyData.systemType}
                </div>
                <div>
                    D:{result.tradingStrategyData.deposit}-S%:{result.tradingStrategyData.maxRiskPerTradeInPercent}
                    -T1:{result.tradingStrategyData.firstTakeProfitPerTradeFactor}-T2:{result.tradingStrategyData.secondTakeProfitPerTradeFactor}
                </div>
                <div>
                    {result.tradingStrategyData.status}
                </div>
            </div>
        );
    };

    return (
        <div className="p-grid bot-control-demo" style={{height: outerHeight || 200}}>
            <AutoSizer>
                {({height, width}) => (
                    <List
                        className="List"
                        height={height}
                        itemCount={results.length}
                        itemSize={60}
                        width={width}
                    >
                        {Row}
                    </List>
                )}
            </AutoSizer>
        </div>
    )
};