import * as React from "react";
import {useEffect, useState} from "react";
import {getMoexOpenInterests} from "../../../common/api/rest/analysisRestApi";
import {MoexOpenInterest} from "../../../common/data/open-interest/MoexOpenInterest";
import {MoexOpenInterestView} from "../../analysis/analysis/MoexOpenInterestView";

export interface AnalysisState {
    realDepo: boolean
}

type Props = {
    security: any
}

export const BotControlAnalysisInfo: React.FC<Props> = ({security}) => {
    const [moexOpenInterest, setMoexOpenInterest] = useState<MoexOpenInterest>(null);

    useEffect(() => {
        if (security) {
            getMoexOpenInterests(security.classCode, security.secCode)
                .then(value => setMoexOpenInterest(value.length > 0 ? value[0] : null));
        }

        // Specify how to clean up after this effect:
        return function cleanup() {
        };
    }, [security]);

    if (security) {

        return (
            <>
                <div className="p-grid analysis-head">
                    <MoexOpenInterestView moexOpenInterest={moexOpenInterest}/>
                </div>
            </>
        )
    } else {
        return (
            <div>Select security for analysis info</div>
        )
    }
};