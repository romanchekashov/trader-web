import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { DataTable } from "primereact/datatable";
import { Row } from "primereact/row";
import * as React from "react";
import { useEffect } from "react";
import { round100 } from "../../../../common/utils/utils";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { loadFuturesClientLimits, selectDeposits } from "../../depositsSlice";
import "./DepositView.css";

type Props = {};

interface RowData {
  limit: number;
  used: number;
  margin: number;
  commission: number;
  planned: number;
  result: number;
}

const DepositView: React.FC<Props> = ({}) => {
  const dispatch = useAppDispatch();
  const { futuresClientLimits } = useAppSelector(selectDeposits);

  useEffect(() => {
    loadData();
    setInterval(loadData, 30000);
  }, []);

  const loadData = () => {
    dispatch(loadFuturesClientLimits());
  };

  const data: RowData[] = futuresClientLimits
    ?.filter((value) => value.limit_type === 0)
    .map((value) => {
      const margin = Math.round(value.varmargin + value.accruedint);
      return {
        limit: Math.round(value.cbplimit),
        used: Math.round(value.cbplused),
        margin,
        commission: Math.round(value.ts_comission * 2),
        planned: Math.round(value.cbplplanned),
        result: round100((margin * 100) / value.cbplimit),
      };
    });

  const rowClassName = (rowData) => {
    if (rowData.margin > 0) {
      return { win: true };
    } else if (rowData.margin < 0) {
      return { loss: true };
    }
    return {};
  };

  const headerGroup = (
    <ColumnGroup>
      <Row style={{ height: "10px" }}>
        <Column header="Limit" />
        <Column header="Used" />
        <Column header="Available" />
        <Column header="Margin" />
        <Column header="Comis" />
        <Column header="P&L %" />
      </Row>
    </ColumnGroup>
  );

  if (!data || data.length === 0) {
    return <>Cannot load Deposit</>;
  }

  return (
    <DataTable
      value={data}
      className="deposit-view"
      headerColumnGroup={headerGroup}
      rowClassName={rowClassName}
      virtualRowHeight={24}
    >
      <Column field="limit" />
      <Column field="used" />
      <Column field="planned" />
      <Column field="margin" />
      <Column field="commission" />
      <Column field="result" />
    </DataTable>
  );
};

export default DepositView;
