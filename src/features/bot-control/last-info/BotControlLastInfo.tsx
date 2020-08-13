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
        const [selectedResult, setSelectedResult] = useState<TradingStrategyResult>(null);

        useEffect(() => {
            if (!selectedResult) {
                getAllStrategies()
                    .then(results => {
                        const resultsMap = {}

                        results
                            .filter(result => result.tradingStrategyData)
                            .forEach(result => resultsMap[result.tradingStrategyData.id] = result)

                        setResults(Object.keys(resultsMap)
                            .map(key => resultsMap[key])
                            .sort((a, b) => b.tradingStrategyData.id - a.tradingStrategyData.id));
                    })
                    .catch(console.error);
            }

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
                    const newResults = adjustTradingStrategyResultArray(data)
                    const resultsMap = {}
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
        }, [selectedResult])

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
                        {result.tradingStrategyData.name}-{result.tradingStrategyData.id}-{result.tradingStrategyData.interval}
                    </div>
                    <div>
                        {result.tradingStrategyData.security.classCode}-{result.tradingStrategyData.security.code}-{result.tradingStrategyData.systemType}-{result.tradingStrategyData.interval}
                    </div>
                    <div>
                        D:{result.tradingStrategyData.deposit}-S%:{result.tradingStrategyData.maxRiskPerTradeInPercent}
                        -T1:{result.tradingStrategyData.firstTakeProfitPerTradeFactor}-T2:{result.tradingStrategyData.secondTakeProfitPerTradeFactor}
                    </div>
                    <div>
                        {result.tradingStrategyData.status}
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
                                itemSize={50}
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