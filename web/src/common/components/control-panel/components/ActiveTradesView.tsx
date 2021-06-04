import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { DataTable } from "primereact/datatable";
import { Row } from "primereact/row";
import * as React from "react";
import { useEffect } from "react";
import {
  selectActiveTrades,
  setSelectedActiveTrade,
} from "../../../../app/activeTrades/activeTradesSlice";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import {
  selectSecurities,
  setSecurityById,
} from "../../../../app/securities/securitiesSlice";
import { ActiveTrade } from "../../../data/ActiveTrade";
import { OperationType } from "../../../data/OperationType";
import "./ActiveTradesView.css";

type Props = {
  trades?: ActiveTrade[];
  selected?: ActiveTrade;
  onSelectRow?: (e: any) => void;
};

const ActiveTradesView: React.FC<Props> = ({ }) => {
  const dispatch = useAppDispatch();
  const { security } = useAppSelector(selectSecurities);
  const { activeTrades, selectedActiveTrade } =
    useAppSelector(selectActiveTrades);

  useEffect(() => {
    if (selectedActiveTrade?.secId !== security?.id && activeTrades.length) {
      const activeTrade = activeTrades.find(
        ({ secId }) => secId === security?.id
      );
      if (activeTrade?.secId !== selectedActiveTrade?.secId)
        dispatch(setSelectedActiveTrade(activeTrade));
    }
  }, [security?.id, selectedActiveTrade?.secId, activeTrades.length]);

  const quantityTemplate = (rowData, column) => {
    return OperationType.SELL === rowData.operation
      ? "-" + rowData.quantity
      : rowData.quantity;
  };

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
      const activeTrade: ActiveTrade = e.value;
      if (activeTrade.secId !== selectedActiveTrade?.secId) {
        dispatch(setSecurityById(activeTrade.secId));
      } else {
        dispatch(setSecurityById(undefined));
      }
    }
  };

  const headerGroup = (
    <ColumnGroup>
      <Row style={{ height: "10px" }}>
        <Column header="SecCode" />
        <Column header="Pos" />
        <Column header="Avg Price" />
        <Column header="P&L" />
        <Column header="Stop P&L" />
        <Column header="Target P&L" />
      </Row>
    </ColumnGroup>
  );

  if (!activeTrades.length) return null;

  return (
    <DataTable
      value={activeTrades}
      selectionMode="single"
      selection={selectedActiveTrade}
      onSelectionChange={onSelect}
      className="active-trade-view"
      headerColumnGroup={headerGroup}
      rowClassName={rowClassName}
      virtualRowHeight={24}
    >
      <Column field="secCode" />
      <Column field="quantity" body={quantityTemplate} />
      <Column field="avgPrice" />
      <Column field="plPrice" />
      <Column field="plStop" />
      <Column field="plTarget" />
    </DataTable>
  );
};

export default ActiveTradesView;
