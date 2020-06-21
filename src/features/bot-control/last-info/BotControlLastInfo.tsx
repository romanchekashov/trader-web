import * as React from "react";
import {useEffect, useState} from "react";
import {FixedSizeList as List} from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import "./BotControlLastInfo.css";
import {HistoryStrategyResultDto} from "../../../common/data/history/HistoryStrategyResultDto";
import {getAllStrategies} from "../../../common/api/rest/botControlRestApi";

type Props = {
    onStrategyResultSelected: (result: HistoryStrategyResultDto) => void
    outerHeight?: number
};

export const BotControlLastInfo: React.FC<Props> = ({onStrategyResultSelected, outerHeight}) => {
    const [results, setResults] = useState([]);
    const [selectedResult, setSelectedResult] = useState(null);

    useEffect(() => {
        let alertsSubscription;
        getAllStrategies()
            .then(setResults)
            .catch(console.error);

        // Specify how to clean up after this effect:
        return function cleanup() {
            if (alertsSubscription) alertsSubscription.unsubscribe();
        };
    }, []);

    if (results.length === 0) {
        return (<>No Data</>);
    }

    const Row = ({index, style}) => {
        const result: HistoryStrategyResultDto = results[index];
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
                        itemSize={35}
                        width={width}
                    >
                        {Row}
                    </List>
                )}
            </AutoSizer>
        </div>
    )
};