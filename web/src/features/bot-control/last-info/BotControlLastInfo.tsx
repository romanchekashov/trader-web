import * as React from "react";
import {useState} from "react";
import {FixedSizeList as List} from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import "./BotControlLastInfo.css";
import {TradingStrategyResult} from "../../../common/data/history/TradingStrategyResult";
import moment = require("moment");
import {BotState} from "../running-strategy/bot-state/BotState";
import {RunningStrategyTable} from "../running-strategy/table/RunningStrategyTable";

type Props = {
    results: TradingStrategyResult[]
    onStrategyResultSelected: (result: TradingStrategyResult) => void
    outerHeight?: number
}

export const BotControlLastInfo: React.FC<Props> = ({results, onStrategyResultSelected, outerHeight}) => {

    const [resultsMap, setResultsMap] = useState({});
    const [selectedResult, setSelectedResult] = useState<TradingStrategyResult>(null);

    const onResultSelected = (tsId: number): void => {
        const result = results.find(value => value.tradingStrategyData.id === tsId)
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
                 onClick={event => onResultSelected(result.tradingStrategyData.id)}>
                <div>
                    <strong>{result.tradingStrategyData.id}</strong> {result.tradingStrategyData.name}
                </div>
                <div>
                    <strong>{result.tradingStrategyData.security.shortName}({result.tradingStrategyData.security.secCode})</strong>
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
            <>
                {/*<div className="p-grid bot-control-demo" style={{height: outerHeight || 200}}>
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
                </div>*/}
                <RunningStrategyTable results={results}
                                      onSelectedTsId={onResultSelected}/>
                <BotState tradingStrategyResult={selectedResult}/>
            </>
        )
    } else {
        return (
            <div className="p-grid">
                <div className="p-col-12">
                    No Finished Trading Strategy Bots
                </div>
            </div>
        )
    }
}