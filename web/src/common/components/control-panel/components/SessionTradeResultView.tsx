import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import * as React from "react";
import { SessionTradeResult } from "../../../data/SessionTradeResult";

type Props = {
  result: SessionTradeResult;
};

const SessionTradeResultView: React.FC<Props> = ({ result }) => {
  if (result) {
    return (
      <DataTable value={[result]} virtualRowHeight={24}>
        <Column field="plPrice" header="P&L" />
        <Column field="plStop" header="Stop P&L" />
        <Column field="plTarget" header="Target P&L" />
      </DataTable>
    );
  } else {
    return <></>;
  }
};

export default SessionTradeResultView;
