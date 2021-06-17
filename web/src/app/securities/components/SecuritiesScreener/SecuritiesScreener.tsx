import * as React from "react";
import { useEffect, useState } from "react";
import "../../../../common/components/notifications/styles/Signals.css";
import { BrokerId } from "../../../../common/data/BrokerId";
import { SecurityLastInfo } from "../../../../common/data/security/SecurityLastInfo";
import { TradingPlatform } from "../../../../common/data/trading/TradingPlatform";
import { filterSecurities } from "../../../../common/utils/DataUtils";
import { DATE_TIME_FORMAT } from "../../../../common/utils/utils";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { selectSecurities } from "../../securitiesSlice";
import { SecuritiesFilter } from "./filter/SecuritiesFilter";
import { SecuritiesQuik } from "./quik/SecuritiesQuik";
import "./SecuritiesScreener.css";
import { SecuritiesTinkoffApi } from "./tinkoff/SecuritiesTinkoffApi";
import moment = require("moment");

type Props = {
    onSelectRow: (e: SecurityLastInfo) => void
}

export const SecuritiesScreener: React.FC<Props> = ({ onSelectRow }) => {

    const dispatch = useAppDispatch();
    const { securities, selectedSecurityTypeWrapper } =
        useAppSelector(selectSecurities);

    const securitiesFiltered = filterSecurities(
        securities,
        selectedSecurityTypeWrapper
    );

    const lastTimeUpdate = moment(new Date()).format(DATE_TIME_FORMAT);
    const [platform, setPlatform] = useState<TradingPlatform>(TradingPlatform.QUIK)
    const [brokerId, setBrokerId] = useState<BrokerId>(BrokerId.ALFA_DIRECT)
    const [selectedSecurity, setSelectedSecurity] = useState<SecurityLastInfo>(null)

    useEffect(() => {
        // Specify how to clean up after this effect:
        return function cleanup() {
        }
    }, [])

    const selectSecurity = (sec: SecurityLastInfo) => {
        setSelectedSecurity(sec)
        onSelectRow(sec)
    }

    const selectBrokerId = (brokerId: BrokerId) => {
        setBrokerId(brokerId)
        setPlatform(brokerId === BrokerId.ALFA_DIRECT ? TradingPlatform.QUIK : TradingPlatform.API)
    }

    return (
        <>
            <SecuritiesFilter lastTimeUpdate={lastTimeUpdate}
                onShowAll={() => selectSecurity(null)}
                brokerId={brokerId}
                onBrokerId={selectBrokerId}
                platform={platform} />
            {
                brokerId === BrokerId.ALFA_DIRECT ?
                    <SecuritiesQuik
                        selectedSecurity={selectedSecurity}
                        onSelectRow={selectSecurity}
                        securities={securitiesFiltered} />
                    :
                    <SecuritiesTinkoffApi
                        selectedSecurity={selectedSecurity}
                        onSelectRow={selectSecurity}
                        securities={securitiesFiltered} />
            }
        </>
    )
}