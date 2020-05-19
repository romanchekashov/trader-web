import * as React from "react";
import {Column} from "primereact/components/column/Column";
import {DataTable} from "primereact/components/datatable/DataTable";
import {SessionTradeResult} from "../../../data/SessionTradeResult";

type Props = {
    result: SessionTradeResult
};

const SessionTradeResultView: React.FC<Props> = ({result}) => {
    if (result) {
        return (
            <DataTable value={[result]} responsive>
                <Column field="plPrice" header="P&L"/>
                <Column field="plStop" header="Stop P&L"/>
                <Column field="plTarget" header="Target P&L"/>
            </DataTable>
        )
    } else {
        return (<></>)
    }
};

export default SessionTradeResultView;