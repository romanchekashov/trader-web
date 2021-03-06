import * as React from "react";
import {Column} from "primereact/components/column/Column";
import {DataTable} from "primereact/components/datatable/DataTable";
import {ActiveTrade} from "../../../common/data/ActiveTrade";
import {ColumnGroup} from "primereact/components/columngroup/ColumnGroup";
import {Row} from "primereact/components/row/Row";
import {OperationType} from "../../../common/data/OperationType";
import "./ActiveTradeView.css";

type Props = {
    trade: ActiveTrade
};

const ActiveTradeView: React.FC<Props> = ({trade}) => {

    const quantityTemplate = (rowData, column) => {
        return OperationType.SELL === rowData.operation ? "-" + rowData.quantity : rowData.quantity;
    };

    const rowClassName = (rowData) => {
        if (rowData.plPrice > 0) {
            return { 'win': true };
        } else if (rowData.plPrice < 0) {
            return { 'loss': true };
        }
        return {};
    };

    if (trade) {
        const headerGroup = (
            <ColumnGroup>
                <Row style={{height: '10px'}}>
                    <Column header="Pos" />
                    <Column header="Avg Price" />
                    <Column header="P&L" />
                    <Column header="Stop P&L" />
                    <Column header="Target P&L" />
                </Row>
            </ColumnGroup>
        );

        return (
            <DataTable value={[trade]} responsive
                       headerColumnGroup={headerGroup}
                       rowClassName={rowClassName}>
                <Column field="quantity" body={quantityTemplate}/>
                <Column field="avgPrice" />
                <Column field="plPrice" />
                <Column field="plStop" />
                <Column field="plTarget" />
            </DataTable>
        )
    } else {
        return (<></>)
    }
};

export default ActiveTradeView;