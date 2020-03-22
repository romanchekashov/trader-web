import * as React from "react";
import {useEffect} from "react";
import {ClassCode} from "../../../api/dto/ClassCode";
import {SecurityShare} from "../../../api/dto/SecurityShare";
import {TradePremise} from "../../../api/tradestrategyanalysis/dto/TradePremise";

export interface AnalysisState {
    realDepo: boolean
}

type Props = {
    classCode: ClassCode;
    security: any;
    premise: TradePremise;
};

interface PrimeDropdownItem<T> {
    label: string
    value: T
}

const Analysis: React.FC<Props> = ({classCode, security, premise}) => {
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