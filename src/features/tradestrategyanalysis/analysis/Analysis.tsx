import * as React from "react";
import {useEffect} from "react";
import {ClassCode} from "../../../common/data/ClassCode";
import {SecurityShare} from "../../../common/data/SecurityShare";
import {TradePremise} from "../../../common/data/strategy/TradePremise";
import {Interval} from "../../../common/data/Interval";

export interface AnalysisState {
    realDepo: boolean
}

type Props = {
    classCode: ClassCode
    timeFrameHigh: Interval
    timeFrameTrading: Interval
    timeFrameLow: Interval
    security: any
    premise: TradePremise
}

const Analysis: React.FC<Props> = ({classCode, timeFrameHigh, timeFrameTrading, timeFrameLow, security, premise}) => {
    let initState: AnalysisState = {
        realDepo: false
    };

    const share: SecurityShare = classCode === ClassCode.TQBR ? security : null;

    useEffect(() => {
    });

    if (share && premise) {
        return (
            <>
                <div>Analysis for {share.shortName}</div>
                <div>Trend direction: {premise.analysis.trend.direction}</div>
            </>
        )
    } else if (share) {
        return (
            <div>Analysis for {share.shortName} is loading</div>
        )
    } else {
        return (
            <div>Select security for analysis</div>
        )
    }
};

export default Analysis;