import * as React from "react";
import {useEffect, useState} from "react";
import {SecurityLastInfo} from "../../../common/data/SecurityLastInfo";
import "../../../common/components/notifications/Signals.css";
import "./Securities.css"
import {SecuritiesFilter} from "./filter/SecuritiesFilter";
import {TradingPlatform} from "../../../common/data/TradingPlatform";
import {SecuritiesQuik} from "./quik/SecuritiesQuik";
import {SecuritiesTinkoffApi} from "./tinkoff/SecuritiesTinkoffApi";
import moment = require("moment");

type Props = {
    onSelectRow: (e: SecurityLastInfo) => void
}

export const Securities: React.FC<Props> = ({onSelectRow}) => {
    const [lastTimeUpdate, setLastTimeUpdate] = useState<string>(null)
    const [platform, setPlatform] = useState<TradingPlatform>(TradingPlatform.QUIK);
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

    const onLastTimeUpdate = (updateDate: Date) => {
        setLastTimeUpdate(moment(updateDate).format("HH:mm:ss DD-MM-YYYY"))
    }

    return (
        <>
            <SecuritiesFilter lastTimeUpdate={lastTimeUpdate}
                              onShowAll={() => selectSecurity(null)}
                              platform={platform}
                              onPlatformChange={setPlatform}/>
            {
                platform === TradingPlatform.QUIK ?
                    <SecuritiesQuik selectedSecurity={selectedSecurity}
                                    onSelectRow={selectSecurity}
                                    onLastTimeUpdate={onLastTimeUpdate}/>
                    :
                    <SecuritiesTinkoffApi selectedSecurity={selectedSecurity}
                                          onSelectRow={selectSecurity}
                                          onLastTimeUpdate={onLastTimeUpdate}/>
            }
        </>
    )
}