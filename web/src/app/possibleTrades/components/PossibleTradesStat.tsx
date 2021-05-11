import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { DataTable } from "primereact/datatable";
import { Row } from "primereact/row";
import * as React from "react";
import { OperationType } from "../../../common/data/OperationType";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { PossibleTradeResult } from "../data/PossibleTradeResult";
import { selectPossibleTradesStat } from "../possibleTradesSlice";
import "./PossibleTradesStat.css";
import moment = require("moment");
import { SEC_MAP } from "../../../common/utils/Cache";
import { round10 } from "../../../common/utils/utils";
import { Button } from "primereact/button";

type Props = {
  selected?: PossibleTradeResult;
  onSelectRow?: (e: any) => void;
};

const PossibleTradesStat: React.FC<Props> = ({ selected }) => {
  const dispatch = useAppDispatch();
  const { possibleTradesStat } = useAppSelector(selectPossibleTradesStat);

  const quantityTemplate = (rowData, column) => {
    return OperationType.SELL === rowData.operation
      ? "-" + rowData.quantity
      : rowData.quantity;
  };

  const secTemplate = (rowData, column) =>
    SEC_MAP.get(rowData.possibleTrade.secId).secCode;

  const targetToStopTemplate = (rowData, column) => {
    const { plTarget, plStop } = rowData.possibleTrade;
    return round10(plTarget / plStop);
  };

  const dateTimeTemplate = (rowData, column) =>
    moment(rowData.possibleTrade.stopTrendPoint.dateTime).format("DD-MM HH:mm");

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
      // const activeTrade: ActiveTrade = e.value;
      // if (activeTrade.secId !== selected?.secId) {
      //   dispatch(setSelectedActiveTrade(activeTrade));
      //   dispatch(setSecurityById(activeTrade.secId));
      // } else {
      //   dispatch(setSelectedActiveTrade(undefined));
      //   dispatch(setSecurityById(undefined));
      // }
    }
  };

  const headerGroup = (
    <ColumnGroup>
      <Row style={{ height: "10px" }}>
        <Column header="SecCode" />
        <Column header="quantity" />
        <Column header="Entry Price" />
        <Column header="operation" />
        <Column header="stopPrice" />
        <Column header="Stop P&L" />
        <Column header="Target P&L" />
        <Column header="Target / Stop P&L" />
        <Column header="Result P&L" />
        <Column header="TrendPoint DateTime" />
      </Row>
    </ColumnGroup>
  );

  if (possibleTradesStat.length === 0) {
    return <>No possible trades stat</>;
  }

  const paginatorLeft = (
    <Button type="button" icon="pi pi-refresh" className="p-button-text" />
  );
  const paginatorRight = (
    <Button type="button" icon="pi pi-cloud" className="p-button-text" />
  );

  return (
    <DataTable
      value={possibleTradesStat}
      selectionMode="single"
      selection={selected}
      onSelectionChange={onSelect}
      className="active-trade-view"
      headerColumnGroup={headerGroup}
      rowClassName={rowClassName}
      virtualRowHeight={24}
      paginator
      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
      rows={10}
      rowsPerPageOptions={[10, 20, 50]}
      paginatorLeft={paginatorLeft}
      paginatorRight={paginatorRight}
    >
      <Column field="possibleTrade.secId" body={secTemplate} />
      <Column field="possibleTrade.quantity" />
      <Column field="possibleTrade.entryPrice" />
      <Column field="possibleTrade.operation" />
      <Column field="possibleTrade.stopPrice" />
      <Column field="possibleTrade.plStop" />
      <Column field="possibleTrade.plTarget" />
      <Column field="possibleTrade.plTarget" body={targetToStopTemplate} />
      <Column field="plResult" />
      <Column
        field="possibleTrade.stopTrendPoint.dateTime"
        body={dateTimeTemplate}
      />
    </DataTable>
  );
};

export default PossibleTradesStat;
