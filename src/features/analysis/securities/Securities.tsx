import * as React from "react";
import {useEffect, useState} from "react";
import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";
import {Button} from "primereact/button";
import {WebsocketService, WSEvent} from "../../../common/api/WebsocketService";
import {SecurityLastInfo} from "../../../common/data/SecurityLastInfo";
import moment = require("moment");

type Props = {
    onSelectRow: (e: SecurityLastInfo) => void
}

export const Securities: React.FC<Props> = ({onSelectRow}) => {
    const [lastTimeUpdate, setLastTimeUpdate] = useState<string>(null)
    const [securities, setSecurities] = useState<SecurityLastInfo[]>([])
    const [selectedSecurity, setSelectedSecurity] = useState<SecurityLastInfo>(null)

    const columns = [
        {field: 'shortName', header: 'Наз'},
        {field: 'secCode', header: 'Тикер'},
        {field: 'lastChange', header: '% изм'},
        {field: 'lastTradePrice', header: 'Цен посл'},
        {field: 'valueToday', header: 'Оборот'},
        {field: 'numTradesToday', header: 'Кол-во сделок'},
        {field: 'percentOfFloatTradedToday', header: '% Flt Traded'},
        {field: 'atrDayPercent', header: 'ATR(D)%'},
        {field: 'atrM60Percent', header: 'ATR(M60)%'},
        {field: 'atrM5Percent', header: 'ATR(M5)%'},
        {field: 'gapDay', header: 'Gap(D)'},
        {field: 'gapDayPercent', header: 'Gap(D)%'},
        {field: 'volumeM60Percent', header: 'Vol(M60)%'},
        {field: 'volumeM5Percent', header: 'Vol(M5)%'},
        {field: 'volumeToday', header: 'Vol Today'},
        {field: 'relativeVolumeDay', header: 'Rel Vol(D)'}
    ]

    const lessColumns = [
        {field: 'shortName', header: 'Наз'},
        {field: 'lastChange', header: '% изм'},
        {field: 'atrM5Percent', header: 'ATR(M5)%'},
        {field: 'volumeM5Percent', header: 'Vol(M5)%'},
        {field: 'relativeVolumeDay', header: 'Rel Vol(D)'}
    ]

    useEffect(() => {
        const lastSecuritiesSubscription = WebsocketService.getInstance()
            .on<SecurityLastInfo[]>(WSEvent.LAST_SECURITIES)
            .subscribe(securities => {
                setSecurities(securities)
                setLastTimeUpdate(moment().format("HH:mm:ss DD-MM-YYYY"))
            })

        // Specify how to clean up after this effect:
        return function cleanup() {
            lastSecuritiesSubscription.unsubscribe()
        }
    }, [])

    const selectedColumns = selectedSecurity ? lessColumns : columns
    const columnComponents = selectedColumns.map(col => {
        return <Column key={col.field} field={col.field} header={col.header} sortable={true} filter={true}/>
    })

    const onSelect = (e) => {
        if (!Array.isArray(e.value)) {
            selectSecurity(e.value)
        }
    }

    const selectSecurity = (sec: SecurityLastInfo) => {
        setSelectedSecurity(sec)
        onSelectRow(sec)
    }

    return (
        <>
            <div className="p-col-2">
                <Button label="Show All" icon="pi pi-caret-right" onClick={(e) => selectSecurity(null)}/>
            </div>
            <div className="p-col-2">{lastTimeUpdate}</div>
            <DataTable value={securities} responsive
                       selectionMode="single"
                       selection={selectedSecurity}
                       onSelectionChange={onSelect}
                       scrollable={!!selectedSecurity}
                       scrollHeight="600px">
                {columnComponents}
            </DataTable>
        </>
    )
}