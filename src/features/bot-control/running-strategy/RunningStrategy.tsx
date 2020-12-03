import * as React from "react";
import {useState} from "react";
import "./RunningStrategy.css";
import {TradingStrategyResult} from "../../../common/data/history/TradingStrategyResult";
import {BotState} from "./bot-state/BotState";
import {RunningStrategyTable} from "./table/RunningStrategyTable";

type Props = {
    results: TradingStrategyResult[]
}

export const RunningStrategy: React.FC<Props> = ({results}) => {

    const [selectedTsId, setSelectedTsId] = useState<number>(null)

    const selectedTs = results.find(value => value.tradingStrategyData.id === selectedTsId)

    return (
        <div>
            <RunningStrategyTable results={results}
                                  onSelectedTsId={setSelectedTsId}/>
            <BotState tradingStrategyResult={selectedTs}/>
        </div>
    )
}