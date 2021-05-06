import * as React from "react";
import { useEffect, useState } from "react";
import "./DepositView.css";
import { getFuturesLimits } from "../../../api/rest/traderRestApi";
import { round100 } from "../../../utils/utils";
import { Row } from "primereact/row";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { DataTable } from "primereact/datatable";

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
  const [data, setData] = useState<RowData[]>([]);

  useEffect(() => {
    setInterval(() => {
      getFuturesLimits().then((limits) => {
        setData(
          limits
            .filter((value) => value.limit_type === 0)
            .map((value) => ({
              limit: Math.round(value.cbplimit),
              used: Math.round(value.cbplused),
              margin: value.varmargin,
              commission: value.ts_comission * 2,
              planned: Math.round(value.cbplplanned),
              result: round100((value.varmargin * 100) / value.cbplimit),
            }))
        );
      });
    }, 30000);
  }, []);

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
        <Column header="Margin" />
        <Column header="Comis" />
        <Column header="Plan" />
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
      <Column field="margin" />
      <Column field="commission" />
      <Column field="planned" />
      <Column field="result" />
    </DataTable>
  );
};

export default DepositView;
