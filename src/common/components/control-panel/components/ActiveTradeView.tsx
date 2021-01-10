import * as React from "react";
import { Column } from "primereact/components/column/Column";
import { DataTable } from "primereact/components/datatable/DataTable";
import { ColumnGroup } from "primereact/components/columngroup/ColumnGroup";
import { Row } from "primereact/components/row/Row";
import "./ActiveTradeView.css";
import { ActiveTrade } from "../../../data/ActiveTrade";
import { OperationType } from "../../../data/OperationType";

type Props = {
    trades: ActiveTrade[]
    selected: ActiveTrade
    onSelectRow: (e: any) => void
}

const ActiveTradeView: React.FC<Props> = ({ trades, selected, onSelectRow }) => {

    const quantityTemplate = (rowData, column) => {
        return OperationType.SELL === rowData.operation ? "-" + rowData.quantity : rowData.quantity
    }

    const rowClassName = (rowData) => {
        if (rowData.plPrice > 0) {
            return { 'win': true }
        } else if (rowData.plPrice < 0) {
            return { 'loss': true }
        }
        return {}
    }

    const onSelect = (e) => {
        if (!Array.isArray(e.value)) {
            onSelectRow(e.value)
        }
    }

    const headerGroup = (
        <ColumnGroup>
            <Row style={{ height: '10px' }}>
                <Column header="Pos" />
                <Column header="Avg Price" />
                <Column header="P&L" />
                <Column header="Stop P&L" />
                <Column header="Target P&L" />
            </Row>
        </ColumnGroup>
    )

    if (!trades || trades.length === 0) {
        return (<>No Active Trades</>)
    }

    return (
        <DataTable value={trades} responsive
            selectionMode="single"
            selection={selected}
            onSelectionChange={onSelect}
            className="active-trade-view"
            headerColumnGroup={headerGroup}
            rowClassName={rowClassName}
            virtualRowHeight={24}>

            <Column field="quantity" body={quantityTemplate} />
            <Column field="avgPrice" />
            <Column field="plPrice" />
            <Column field="plStop" />
            <Column field="plTarget" />
        </DataTable>
    )
}

export default ActiveTradeView