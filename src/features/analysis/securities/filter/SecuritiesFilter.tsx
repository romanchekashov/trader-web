import * as React from "react";
import {useEffect} from "react";
import {Toolbar} from 'primereact/toolbar';
import {Button} from "primereact/button";
import {Dropdown} from "primereact/dropdown";
import {TradingPlatform} from "../../../../common/data/trading/TradingPlatform";
import {BrokerId} from "../../../../common/data/BrokerId";
import {SecurityType} from "../../../../common/data/security/SecurityType";

type Props = {
    lastTimeUpdate: string
    brokerId: BrokerId
    onBrokerId: (brokerId: BrokerId) => void
    platform: TradingPlatform
    // onPlatformChange: (platform: TradingPlatform) => void
    onShowAll: () => void
    secType: SecurityType
    changeSecType: (secType: SecurityType) => void
}

export const SecuritiesFilter: React.FC<Props> = ({lastTimeUpdate, onShowAll, brokerId, onBrokerId, platform, secType, changeSecType}) => {

    const ALL = "ALL"
    const brokerIds = [BrokerId.ALFA_DIRECT, BrokerId.TINKOFF_INVEST].map(val => ({label: val, value: val}))
    const secTypes = [ALL, SecurityType.FUTURE, SecurityType.STOCK, SecurityType.CURRENCY]
        .map(val => ({label: val, value: val === ALL ? null : val}))
    const platforms = (brokerId === BrokerId.ALFA_DIRECT ? [TradingPlatform.QUIK] : [TradingPlatform.API])
        .map(val => ({label: val, value: val}))

    const updateSecType = (e: any): void => changeSecType(e.value)

    useEffect(() => {
    }, [])

    return (
        <Toolbar className="filter" style={{padding: 0}}>
            <div className="p-toolbar-group-left">
                <Dropdown value={brokerId} options={brokerIds} onChange={(e) => {
                    onShowAll()
                    onBrokerId(e.value)
                }} placeholder="Select a broker" style={{width: '120px'}}/>
                <Dropdown value={platform} options={platforms} onChange={(e) => {
                    // onPlatformChange(e.value)
                }} placeholder="Select a platform" style={{width: '120px'}}/>
                <Dropdown value={secType}
                          options={secTypes}
                          onChange={updateSecType}
                          style={{width: '120px'}}/>
                <Button label="Show All" icon="pi pi-caret-right" onClick={(e) => onShowAll()}/>
            </div>
            <div className="p-toolbar-group-right">
                {lastTimeUpdate}
            </div>
        </Toolbar>
    )
}