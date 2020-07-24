import * as React from "react";
import {useEffect, useState} from "react";
import {MoexOpenInterest} from "../../../common/data/open-interest/MoexOpenInterest";
import {getMoexApiOpenInterestList, getMoexOpenInterests} from "../../../common/api/rest/analysisRestApi";
import {SecurityLastInfo} from "../../../common/data/SecurityLastInfo";
import {MoexOpenInterestChart} from "./MoexOpenInterestChart";
import {MoexOpenInterestTable} from "./MoexOpenInterestTable";
import moment = require("moment");

type Props = {
    security: SecurityLastInfo
}

export const MoexOpenInterestView: React.FC<Props> = ({security}) => {

    const [moexOpenInterestsForDays, setMoexOpenInterestsForDays] = useState<MoexOpenInterest[]>([])
    const [moexOpenInterests, setMoexOpenInterests] = useState<MoexOpenInterest[]>([])

    useEffect(() => {
        if (security) {
            const from = moment().subtract(100, 'days').format("YYYY-MM-DD")

            getMoexOpenInterests(security.classCode, security.secCode, from)
                .then(setMoexOpenInterestsForDays)

            getMoexApiOpenInterestList(security.classCode, security.secCode)
                .then(setMoexOpenInterests)
        }

        const intervalToFetchOpenInterest = setInterval(() => {
            if (security) {
                getMoexApiOpenInterestList(security.classCode, security.secCode)
                    .then(setMoexOpenInterests)
            }
        }, 60000)

        // Specify how to clean up after this effect:
        return function cleanup() {
            clearInterval(intervalToFetchOpenInterest)
        };
    }, [security])

    return (
        <div className="p-grid analysis-head">
            <div className="p-col-6">
                <MoexOpenInterestTable moexOpenInterest={moexOpenInterestsForDays.length > 0
                    ? moexOpenInterestsForDays[moexOpenInterestsForDays.length - 1] : null}/>
            </div>
            <div className="p-col-6">
                <MoexOpenInterestChart moexOpenInterests={moexOpenInterests}
                                       title={"Real-time OI for last date"}
                                       dateTimeFormat={"HH:mm/DD MMM YY"}
                                       width={500} height={400}/>
            </div>
            <div className="p-col-12">
                <MoexOpenInterestChart moexOpenInterests={moexOpenInterestsForDays}
                                       title={"OI history"}
                                       dateTimeFormat={"DD MMM YY"}
                                       width={1000} height={600}/>
            </div>
        </div>
    )
}