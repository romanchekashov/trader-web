import * as React from "react";
import { useEffect, useState } from "react";
import "../../../common/components/notifications/styles/Signals.css";
import { BrokerId } from "../../../common/data/BrokerId";
import { SecurityLastInfo } from "../../../common/data/security/SecurityLastInfo";
import { SecurityTypeWrapper } from "../../../common/data/security/SecurityTypeWrapper";
import { TradingPlatform } from "../../../common/data/trading/TradingPlatform";
import { SecuritiesFilter } from "./filter/SecuritiesFilter";
import { SecuritiesQuik } from "./quik/SecuritiesQuik";
import "./SecuritiesScreener.css";
import { SecuritiesTinkoffApi } from "./tinkoff/SecuritiesTinkoffApi";
import moment = require("moment");

type Props = {
    onSelectRow: (e: SecurityLastInfo) => void
}

export const SecuritiesScreener: React.FC<Props> = ({ onSelectRow }) => {
    const [lastTimeUpdate, setLastTimeUpdate] = useState<string>(null)
    const [platform, setPlatform] = useState<TradingPlatform>(TradingPlatform.QUIK)
    const [brokerId, setBrokerId] = useState<BrokerId>(BrokerId.ALFA_DIRECT)
    const [selectedSecurity, setSelectedSecurity] = useState<SecurityLastInfo>(null)
    const [secType, setSecType] = useState<SecurityTypeWrapper>(SecurityTypeWrapper.FUTURE)

    useEffect(() => {
        // Specify how to clean up after this effect:
        return function cleanup() {
        }
    }, [])

    const selectSecurity = (sec: SecurityLastInfo) => {
        setSelectedSecurity(sec)
        onSelectRow(sec)
    }

    const onLastTimeUpdate = (updateDate: Date) => {
        setLastTimeUpdate(moment(updateDate).format("HH:mm:ss DD-MM-YYYY"))
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
                platform={platform}
                secType={secType}
                changeSecType={setSecType} />
            {
                brokerId === BrokerId.ALFA_DIRECT ?
                    <SecuritiesQuik secType={secType}
                        selectedSecurity={selectedSecurity}
                        onSelectRow={selectSecurity}
                        onLastTimeUpdate={onLastTimeUpdate} />
                    :
                    <SecuritiesTinkoffApi selectedSecurity={selectedSecurity}
                        onSelectRow={selectSecurity}
                        onLastTimeUpdate={onLastTimeUpdate} />
            }
        </>
    )
}