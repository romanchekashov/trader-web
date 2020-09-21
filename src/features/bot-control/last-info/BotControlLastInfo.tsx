import * as React from "react";
import {useEffect, useState} from "react";
import {FixedSizeList as List} from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import "./BotControlLastInfo.css";
import {TradingStrategyResult} from "../../../common/data/history/TradingStrategyResult";
import {getAllStrategies} from "../../../common/api/rest/botControlRestApi";
import {WebsocketService, WSEvent} from "../../../common/api/WebsocketService";
import {adjustTradingStrategyResultArray} from "../../../common/utils/DataUtils";
import moment = require("moment");

type Props = {
    onStrategyResultSelected: (result: TradingStrategyResult) => void
    onSelectedTSResultUpdate: (result: TradingStrategyResult) => void
    outerHeight?: number
};

export const BotControlLastInfo: React.FC<Props> =
    ({onStrategyResultSelected, onSelectedTSResultUpdate, outerHeight}) => {

        const [results, setResults] = useState<TradingStrategyResult[]>([]);
        const [resultsMap, setResultsMap] = useState({});
        const [selectedResult, setSelectedResult] = useState<TradingStrategyResult>(null);

        useEffect(() => {
            if (!selectedResult) {
                getAllStrategies()
                    .then(results => {
                        const resultsMap = {}
                        results.forEach(result => resultsMap[result.tradingStrategyData.id] = result)
                        setResultsMap(resultsMap)
                        setResults(results
                            .sort((a, b) => b.tradingStrategyData.id - a.tradingStrategyData.id))
                    })
                    .catch(console.error);
            }
        }, [selectedResult])

        useEffect(() => {
            const wsStatusSub = WebsocketService.getInstance()
                .connectionStatus()
                .subscribe(isConnected => {
                    if (isConnected) {
                        // informServerAboutRequiredData();
                    }
                })

            const tradingStrategiesStatesSubscription = WebsocketService.getInstance()
                .on<TradingStrategyResult[]>(WSEvent.TRADING_STRATEGIES_RESULTS)
                .subscribe(data => {
                    const newResults: TradingStrategyResult[] = adjustTradingStrategyResultArray(data)
                    newResults.forEach(result => resultsMap[result.tradingStrategyData.id] = result)

                    setResults(Object.keys(resultsMap)
                        .map(key => resultsMap[key])
                        .sort((a, b) => b.tradingStrategyData.id - a.tradingStrategyData.id))

                    for (const result of newResults) {
                        if (selectedResult === null || selectedResult.tradingStrategyData.id === result.tradingStrategyData.id) {
                            onSelectedTSResultUpdate(result)
                        }
                    }
                })

            // Specify how to clean up after this effect:
            return function cleanup() {
                if (wsStatusSub) wsStatusSub.unsubscribe()
                if (tradingStrategiesStatesSubscription) tradingStrategiesStatesSubscription.unsubscribe()
            }
        }, [selectedResult, resultsMap])

        const onResultSelected = (result: TradingStrategyResult): void => {
            setSelectedResult(result)
            onStrategyResultSelected(result)
        }

        const Row = ({index, style}) => {
            const result: TradingStrategyResult = results[index];
            let className = index % 2 ? "bot-control-last-info-row-odd " : "bot-control-last-info-row-even ";
            className += (selectedResult === result ? "row-selected" : "");

            return (
                <div className={className}
                     style={style}
                     key={result.tradingStrategyData.id}
                     onClick={event => onResultSelected(result)}>
                    <div>
                        <strong>{result.tradingStrategyData.id}</strong> {result.tradingStrategyData.name}
                    </div>
                    <div>
                        <strong>{result.tradingStrategyData.security.secCode}</strong>
                    </div>
                    <div>
                        D:<strong>{result.tradingStrategyData.deposit}</strong>-S%:{result.tradingStrategyData.maxRiskPerTradeInPercent}
                        -T1:{result.tradingStrategyData.firstTakeProfitPerTradeFactor}-T2:{result.tradingStrategyData.secondTakeProfitPerTradeFactor}
                    </div>
                    <div>
                        <strong>{result.tradingStrategyData.systemType.substr(0, 4)} {result.tradingStrategyData.interval} {result.tradingStrategyData.status.substr(0, 4)}</strong>
                    </div>
                    <div>
                        Start: {moment(result.tradingStrategyData.start).format("HH:mm DD-MM")}
                    </div>
                    <div>
                        End: {moment(result.tradingStrategyData.end).format("HH:mm DD-MM")}
                    </div>
                </div>
            );
        };

        if (results.length > 0) {
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
        } else {
            return (
                <div className="p-grid">
                    <div className="p-col-12">
                        No Finished Trading Strategy Bots
                    </div>
                </div>
            );
        }
    };