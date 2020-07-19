import * as React from "react";
import {useEffect, useState} from "react";
import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";
import {getSecurities} from "../../../common/api/rest/analysisRestApi";
import {SecurityAnalysis} from "../../../common/data/SecurityAnalysis";
import {Button} from "primereact/button";

type Props = {
    onSelectRow: (e: SecurityAnalysis) => void
};

export const Securities: React.FC<Props> = ({onSelectRow}) => {
    const [securities, setSecurities] = useState<SecurityAnalysis[]>([]);
    const [selectedSecurity, setSelectedSecurity] = useState<SecurityAnalysis>(null);

    const columns = [
        {field: 'shortName', header: 'Наз'},
        {field: 'secCode', header: 'Тикер'},
        {field: 'lastChange', header: '% изм'},
        {field: 'lastTradePrice', header: 'Цен посл'},
        {field: 'todayMoneyTurnover', header: 'Оборот'},
        {field: 'numberOfTradesToday', header: 'Кол-во сделок'},
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
    ];

    const lessColumns = [
        {field: 'shortName', header: 'Наз'},
        {field: 'lastChange', header: '% изм'},
        {field: 'atrM5Percent', header: 'ATR(M5)%'},
        {field: 'volumeM5Percent', header: 'Vol(M5)%'},
        {field: 'relativeVolumeDay', header: 'Rel Vol(D)'}
    ];

    const FETCH_TIMEOUT = 30000

    const fetchSecurities = () => {
        getSecurities().then(setSecurities)
    }

    useEffect(() => {
        fetchSecurities()
        const setIntervalIdToFetchSecurities = setInterval(() => {
            fetchSecurities()
        }, FETCH_TIMEOUT)

        // Specify how to clean up after this effect:
        return function cleanup() {
            clearInterval(setIntervalIdToFetchSecurities)
        }
    }, []);

    const selectedColumns = selectedSecurity ? lessColumns : columns;
    const columnComponents = selectedColumns.map(col => {
        return <Column key={col.field} field={col.field} header={col.header} sortable={true} filter={true}/>;
    });

    const onSelect = (e) => {
        if (!Array.isArray(e.value)) {
            selectSecurity(e.value)
        }
    }

    const selectSecurity = (sec: SecurityAnalysis) => {
        setSelectedSecurity(sec)
        onSelectRow(sec)
    }

    return (
        <>
            <Button label="Show All" icon="pi pi-caret-right" onClick={(e) => selectSecurity(null)}/>
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
};