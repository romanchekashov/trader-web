import * as React from "react";
import {useEffect, useState} from "react";
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
        {field: 'secCode', header: 'secCode'},
        {field: 'shortName', header: 'shortName'},
        {field: 'lastTradePrice', header: 'lastTradePrice'},
        {field: 'lastChange', header: 'lastChange'},
        {field: 'lastTradeQuantity', header: 'lastTradeQuantity'},
        {field: 'lotSize', header: 'lotSize'},
        {field: 'issueSize', header: 'issueSize'},
        {field: 'weightedAveragePrice', header: 'weightedAveragePrice'},
        {field: 'todayMoneyTurnover', header: 'todayMoneyTurnover'},
        {field: 'numberOfTradesToday', header: 'numberOfTradesToday'}
    ];

    const [selectedColumns, setSelectedColumns] = useState(columns);

    if (selectedShare) {
        setSelectedColumns([
            {field: 'secCode', header: 'secCode'},
            {field: 'shortName', header: 'shortName'},
            {field: 'lastTradePrice', header: 'lastTradePrice'},
            {field: 'lastChange', header: 'lastChange'}
        ]);
    }

    useEffect(() => {
    });

    const columnComponents = selectedColumns.map(col=> {
        return <Column key={col.field} field={col.field} header={col.header} sortable={true} filter={true} />;
    });

    return (
        <DataTable value={shares} responsive
                   selection={selectedShare}
                   onSelectionChange={onSelectRow}>
            <Column selectionMode="multiple" style={{width:'2em'}}/>
            {columnComponents}
        </DataTable>
    )
};

export default Shares;