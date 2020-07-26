import * as React from "react";
import {useEffect} from "react";
import {Toolbar} from 'primereact/toolbar';
import {Button} from "primereact/button";
import {Dropdown} from "primereact/dropdown";
import {TradingPlatform} from "../../../../common/data/TradingPlatform";

type Props = {
    lastTimeUpdate: string
    platform: TradingPlatform
    onPlatformChange: (platform: TradingPlatform) => void
    onShowAll: () => void
}

export const SecuritiesFilter: React.FC<Props> = ({lastTimeUpdate, onShowAll, platform, onPlatformChange}) => {

    const platforms = [TradingPlatform.QUIK, TradingPlatform.API_TINKOFF].map(val => ({label: val, value: val}))

    useEffect(() => {
    }, [])

    return (
        <Toolbar className="filter">
            <div className="p-toolbar-group-left">
                <Dropdown value={platform} options={platforms} onChange={(e) => {
                    onPlatformChange(e.value)
                }} placeholder="Select a platform" style={{width: '120px'}}/>
                <Button label="Show All" icon="pi pi-caret-right" onClick={(e) => onShowAll()}/>
            </div>
            <div className="p-toolbar-group-right">
                {lastTimeUpdate}
            </div>
        </Toolbar>
    )
}