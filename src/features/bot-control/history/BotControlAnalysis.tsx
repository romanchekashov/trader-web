import * as React from "react";
import {TradePremise} from "../../../data/strategy/TradePremise";
import {TradeSetup} from "../../../data/strategy/TradeSetup";
import TrendView from "../../tradestrategyanalysis/trend/TrendView";

type Props = {
    premise: TradePremise
    setup: TradeSetup
};

type States = {
    price: number
    quantity: number
    steps: number
    multiplier: number
};

export class BotControlAnalysis extends React.Component<Props, States> {

    private multipliers = [1, 2, 4, 8];

    constructor(props) {
        super(props);
        this.state = {price: 0, quantity: 1, steps: 2, multiplier: 1};
    }

    render() {
        const {premise, setup} = this.props;
        const {price, quantity, steps, multiplier} = this.state;
        //
        if (!premise) {
            return <div>Loading...</div>
        }


        return (
            <div className="p-grid td__analysis">
                <div className="p-col-6">
                    <span style={{marginRight: '2px'}}>
                            TFHigh: {premise.analysis.tradingStrategyConfig.timeFrameHigher}</span>
                    <span style={{marginRight: '2px'}}>
                            TFTrading: {premise.analysis.tradingStrategyConfig.timeFrameTrading}</span>
                    <span>TFLow: {premise.analysis.tradingStrategyConfig.timeFrameLower}</span>
                </div>
                <div className="p-col-6">
                    Momentum State: {premise.analysis.momentum.state}
                </div>
                <div className="p-col-6">
                    <TrendView trend={premise.analysis.trend} />
                </div>
                <div className="p-col-6">
                    <ul>
                        <li>TFHighSentiment: {premise.sentiment.timeFrameHigherCandleSentiment}</li>
                        <li>TFTradingSentiment: {premise.sentiment.timeFrameTradingCandleSentiment}</li>
                        <li>TFLowSentiment: {premise.sentiment.timeFrameLowerCandleSentiment}</li>
                    </ul>
                </div>
            </div>
        )
    }
}