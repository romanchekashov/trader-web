import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { SelectButton } from "primereact/selectbutton";
import * as React from "react";
import { useEffect } from "react";
import { BrokerId } from "../../../../../common/data/BrokerId";
import { SecurityTypeWrapper } from "../../../../../common/data/security/SecurityTypeWrapper";
import { TradingPlatform } from "../../../../../common/data/trading/TradingPlatform";
import "./SecuritiesFilter.css";

type Props = {
    lastTimeUpdate: string
    brokerId: BrokerId
    onBrokerId: (brokerId: BrokerId) => void
    platform: TradingPlatform
    // onPlatformChange: (platform: TradingPlatform) => void
    onShowAll: () => void
    secType: SecurityTypeWrapper
    changeSecType: (secType: SecurityTypeWrapper) => void
}

export const SecuritiesFilter: React.FC<Props> = ({ lastTimeUpdate, onShowAll, brokerId, onBrokerId, platform, secType, changeSecType }) => {

    const types = [
        { label: 'ALL', value: null },
        { label: 'STOCK', value: SecurityTypeWrapper.STOCK },
        { label: 'RusStock', value: SecurityTypeWrapper.STOCK_RU },
        { label: 'UsStock', value: SecurityTypeWrapper.STOCK_US },
        { label: 'STOCK_1', value: SecurityTypeWrapper.STOCK_1 },
        { label: 'STOCK_2', value: SecurityTypeWrapper.STOCK_2 },
        { label: 'STOCK_3', value: SecurityTypeWrapper.STOCK_3 },
        { label: 'FUTURE', value: SecurityTypeWrapper.FUTURE },
        { label: 'CURRENCY', value: SecurityTypeWrapper.CURRENCY }
    ]
    const ALL = "ALL"
    const brokerIds = [BrokerId.ALFA_DIRECT, BrokerId.TINKOFF_INVEST].map(val => ({ label: val, value: val }))
    const platforms = (brokerId === BrokerId.ALFA_DIRECT ? [TradingPlatform.QUIK] : [TradingPlatform.API])
        .map(val => ({ label: val, value: val }))

    const updateSecType = (e: any): void => changeSecType(e.value)

    useEffect(() => {
    }, [])

    return (
        <div className="securities-filter">
            <Dropdown value={brokerId}
                options={brokerIds}
                onChange={(e) => {
                    onShowAll()
                    onBrokerId(e.value)
                }}
                placeholder="Select a broker"
                style={{ width: '120px', marginRight: '5px' }} />

            <Dropdown value={platform}
                options={platforms}
                onChange={(e) => {
                    // onPlatformChange(e.value)
                }}
                placeholder="Select a platform"
                style={{ width: '120px', marginRight: '5px' }} />

            <SelectButton value={secType}
                options={types}
                onChange={updateSecType}
                style={{ display: 'inline-block', marginRight: '5px' }} />

            <Button label="Show All" icon="pi pi-caret-right"
                onClick={(e) => onShowAll()}
                style={{ marginRight: '5px' }} />

            <div className="p-toolbar-group-right">
                {lastTimeUpdate}
            </div>
        </div>
    )
}