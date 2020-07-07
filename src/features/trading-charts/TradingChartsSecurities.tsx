import * as React from "react";
import {useEffect, useState} from "react";
import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";
import {SecurityLastInfo} from "../../common/data/SecurityLastInfo";
import {ClassCode} from "../../common/data/ClassCode";

type Props = {
    classCode: ClassCode
    securities: SecurityLastInfo[]
    onSelectRow: (e: any) => void
};

export const TradingChartsSecurities: React.FC<Props> = ({classCode, securities, onSelectRow}) => {

    const columns = [
        {field: 'shortName', header: 'Наз'},
        {field: 'lastChange', header: '% изм'},
        {field: 'priceLastTrade', header: 'Цен посл'},
        {field: 'futureTotalDemand', header: 'Об спр'},
        {field: 'futureTotalSupply', header: 'Об пред'},
        {field: 'futureSellDepoPerContract', header: 'ГО прод'},
        {field: 'futureBuyDepoPerContract', header: 'ГО покуп'},
        {field: 'valueToday', header: 'Оборот'},
        {field: 'numberOfTradesToday', header: 'Кол сдел'}
    ];

    const [securityLastInfo, setSecurityLastInfo] = useState<SecurityLastInfo>(null);

    useEffect(() => {
    });

    const columnComponents = columns.map(col => {
        return <Column key={col.field} field={col.field} header={col.header} sortable={true} filter={true}/>;
    });

    const onSelect = (e) => {
        if (!Array.isArray(e.value)) {
            setSecurityLastInfo(e.value)
            onSelectRow(e.value)
        }
    };

    return (
        <div className="p-grid analysis-securities">
            <DataTable value={securities} responsive
                       selectionMode="single"
                       selection={securityLastInfo}
                       onSelectionChange={onSelect}
                       scrollable={true}
                       scrollHeight="600px">
                {columnComponents}
            </DataTable>
        </div>
    )
};