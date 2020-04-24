import * as React from "react";
import {useEffect} from "react";
import {SecurityShare} from "../../../api/dto/SecurityShare";
import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";

type Props = {
    shares: SecurityShare[]
    selectedShare: SecurityShare
    onSelectRow: (e: any) => void
};

const Shares: React.FC<Props> = ({shares, selectedShare, onSelectRow}) => {

    const columns = [
        {field: 'shortName', header: 'Наз'},
        {field: 'lastChange', header: '% изм'},
        {field: 'lastTradePrice', header: 'Цен посл'},
        {field: 'lastTradeQuantity', header: 'Объем посл'},
        {field: 'lotSize', header: 'lotSize'},
        {field: 'issueSize', header: 'issueSize'},
        {field: 'weightedAveragePrice', header: 'weightedAveragePrice'},
        {field: 'todayMoneyTurnover', header: 'Оборот'},
        {field: 'numberOfTradesToday', header: 'numberOfTradesToday'}
    ];

    const lessColumns = [
        {field: 'shortName', header: 'Наз'},
        {field: 'lastChange', header: '% изм'},
        {field: 'lastTradePrice', header: 'Цен посл'}
    ];

    useEffect(() => {
    });

    const selectedColumns = selectedShare ? lessColumns : columns;
    const columnComponents = selectedColumns.map(col=> {
        return <Column key={col.field} field={col.field} header={col.header} sortable={true} filter={true} />;
    });

    return (
        <DataTable value={shares} responsive
                   selectionMode="single"
                   selection={selectedShare}
                   onSelectionChange={(e) => onSelectRow(e.value[0])}
                   scrollable={!!selectedShare}
                   scrollHeight="600px">
            <Column selectionMode="multiple" style={{width:'2em'}}/>
            {columnComponents}
        </DataTable>
    )
};

export default Shares;