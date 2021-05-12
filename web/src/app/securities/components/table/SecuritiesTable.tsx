import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { DataTable } from "primereact/datatable";
import { Row } from "primereact/row";
import * as React from "react";
import { SecurityLastInfo } from "../../../../common/data/security/SecurityLastInfo";
import { formatNumber } from "../../../../common/utils/utils";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { selectSecurities, setSecurityById } from "../../securitiesSlice";
import "./SecuritiesTable.css";

type Props = {
  securities: SecurityLastInfo[];
};

const SecuritiesTable: React.FC<Props> = ({ securities }) => {
  const dispatch = useAppDispatch();
  const { security } = useAppSelector(selectSecurities);

  if (securities.length === 0) {
    return <>No data</>;
  }

  const rowClassName = (rowData) => {
    if (rowData.plPrice > 0) {
      return { win: true };
    } else if (rowData.plPrice < 0) {
      return { loss: true };
    }
    return {};
  };

  const onSelect = (e) => {
    if (!Array.isArray(e.value)) {
      const sec: SecurityLastInfo = e.value;
      if (sec && sec.id !== security?.id) {
        dispatch(setSecurityById(sec.id));
      } else {
        dispatch(setSecurityById(undefined));
      }
    }
  };

  const valueTodayTemplate = (rowData, column) => {
    return formatNumber(rowData.valueToday);
  };

  const valueTodaySort = (e: any) => {
    if (e.order > 0) {
      return securities.sort((a, b) => a.valueToday - b.valueToday);
    }
    return securities.sort((a, b) => b.valueToday - a.valueToday);
  };

  const headerGroup = (
    <ColumnGroup>
      <Row style={{ height: "10px" }}>
        <Column header="SecCode" />
        <Column header="Цен посл" />
        <Column header="% изм" />
        <Column header="Оборот" sortable sortFunction={valueTodaySort} />
      </Row>
    </ColumnGroup>
  );

  return (
    <DataTable
      value={securities}
      selectionMode="single"
      metaKeySelection={false}
      selection={security}
      dataKey="id"
      onSelectionChange={onSelect}
      className="active-trade-view"
      headerColumnGroup={headerGroup}
      rowClassName={rowClassName}
      virtualRowHeight={24}
      scrollable
      scrollHeight="400px"
    >
      <Column field="code" />
      <Column field="lastTradePrice" />
      <Column field="lastChange" />
      <Column field="valueToday" body={valueTodayTemplate} />
    </DataTable>
  );
};

export default SecuritiesTable;
