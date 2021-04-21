import * as React from "react";
import {TradePremise} from "../../common/data/strategy/TradePremise";
import {TradeSetup} from "../../common/data/strategy/TradeSetup";
import "./AnalysisLine.css";

type Props = {
    premise: TradePremise
    setup: TradeSetup
};

const AnalysisLine: React.FC<Props> = ({premise, setup}) => {

    const getTrend = () => {
        return premise ? premise.analysis.trend.direction : null;
    };

    return (
        <div className="p-grid td__analysis-line">
            <div className="p-col-4 tfh">
                <div>TFH:</div>
                <div>{premise ? premise.analysis.tfHighTrend.direction : null}</div>
                <div>{premise ? premise.sentiment.timeFrameHigherCandleSentiment : null}</div>
            </div>
            <div className="p-col-4 tft">
                <div>TFT:</div>
                <div>{premise ? premise.analysis.trend.direction : null}</div>
                <div>{premise ? premise.sentiment.timeFrameTradingCandleSentiment : null}</div>
            </div>
            <div className="p-col-4 tfl">
                <div>TFL:</div>
                <div>{premise ? premise.analysis.tfLowTrend.direction : null}</div>
                <div>{premise ? premise.sentiment.timeFrameLowerCandleSentiment : null}</div>
            </div>
        </div>
    )
};

export default AnalysisLine;