import * as React from "react";
import {useEffect} from "react";
import {Toolbar} from 'primereact/toolbar';
import {Button} from "primereact/button";
import {Dropdown} from "primereact/dropdown";
import {TradingPlatform} from "../../../../common/data/trading/TradingPlatform";
import {BrokerId} from "../../../../common/data/BrokerId";

type Props = {
    lastTimeUpdate: string
    brokerId: BrokerId
    onBrokerId: (brokerId: BrokerId) => void
    platform: TradingPlatform
    // onPlatformChange: (platform: TradingPlatform) => void
    onShowAll: () => void
}

export const SecuritiesFilter: React.FC<Props> = ({lastTimeUpdate, onShowAll, brokerId, onBrokerId, platform}) => {

    const brokerIds = [BrokerId.ALFA_DIRECT, BrokerId.TINKOFF_INVEST].map(val => ({label: val, value: val}))
    const platforms = (brokerId === BrokerId.ALFA_DIRECT ? [TradingPlatform.QUIK] : [TradingPlatform.API])
        .map(val => ({label: val, value: val}))

    useEffect(() => {
    }, [])

    return (
        <Toolbar className="filter">
            <div className="p-toolbar-group-left">
                <Dropdown value={brokerId} options={brokerIds} onChange={(e) => {
                    onBrokerId(e.value)
                }} placeholder="Select a broker" style={{width: '120px'}}/>
                <Dropdown value={platform} options={platforms} onChange={(e) => {
                    // onPlatformChange(e.value)
                }} placeholder="Select a platform" style={{width: '120px'}}/>
                <Button label="Show All" icon="pi pi-caret-right" onClick={(e) => onShowAll()}/>
            </div>
            <div className="p-toolbar-group-right">
                {lastTimeUpdate}
            </div>
        </Toolbar>
    )
}