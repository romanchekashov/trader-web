import * as React from "react";
import {useEffect, useState} from "react";
import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";
import {SecurityCurrency} from "../../../api/dto/SecurityCurrency";

type Props = {
    currencies: SecurityCurrency[]
    selectedCurrencies: SecurityCurrency[]
    onSelectRow: (e: any) => void
};

const Currencies: React.FC<Props> = ({currencies, selectedCurrencies, onSelectRow}) => {

    const columns = [
        {field: 'secCode', header: 'secCode'},
        {field: 'name', header: 'name'},
        {field: 'lastTradePrice', header: 'lastTradePrice'},
        {field: 'lastChange', header: 'lastChange'},
        {field: 'lastTradeQuantity', header: 'lastTradeQuantity'},
        {field: 'lotSize', header: 'lotSize'},
        {field: 'weightedAveragePrice', header: 'weightedAveragePrice'},
        {field: 'todayMoneyTurnover', header: 'todayMoneyTurnover'},
        {field: 'numberOfTradesToday', header: 'numberOfTradesToday'}
    ];

    const [selectedColumns, setSelectedColumns] = useState(columns);

    if (selectedCurrencies.length > 0) {
        setSelectedColumns([
            {field: 'secCode', header: 'secCode'},
            {field: 'name', header: 'name'},
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
        <DataTable value={currencies} responsive
                   selection={selectedCurrencies}
                   onSelectionChange={onSelectRow}>
            <Column selectionMode="multiple" style={{width:'2em'}}/>
            {columnComponents}
        </DataTable>
    )
};

export default Currencies;