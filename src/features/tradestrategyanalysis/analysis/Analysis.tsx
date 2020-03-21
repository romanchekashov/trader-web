import * as React from "react";
import {useEffect} from "react";
import {ClassCode} from "../../../api/dto/ClassCode";
import {SecurityShare} from "../../../api/dto/SecurityShare";

export interface AnalysisState {
    realDepo: boolean
}

type Props = {
    classCode: ClassCode;
    security: any;
};

interface PrimeDropdownItem<T> {
    label: string
    value: T
}

const Analysis: React.FC<Props> = ({classCode, security}) => {
    let initState: AnalysisState = {
        realDepo: false
    };

    const share: SecurityShare = classCode === ClassCode.TQBR ? security : null;

    useEffect(() => {
    });

    if (share) {
        return (
            <div>Analysis for {share.shortName}</div>
        )
    } else {
        return (
            <div>Select security for analysis</div>
        )
    }
};

export default Analysis;