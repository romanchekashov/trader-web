import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { DataTable } from "primereact/datatable";
import { Row } from "primereact/row";
import * as React from "react";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { deleteOrder, selectOrders } from "../../../app/orders/ordersSlice";
import { setSecurityById } from "../../../app/securities/securitiesSlice";
import { deleteStop, selectStops } from "../../../app/stops/stopsSlice";
import { OperationType } from "../../data/OperationType";
import { Order } from "../../data/Order";
import { StopOrder } from "../../data/StopOrder";
import { StopOrderKind } from "../../data/StopOrderKind";
import { sortAlphabetically } from "../../utils/utils";
import "./OrdersTable.css";

enum ControlOrderType {
  ORDER = "O",
  STOP_TARGET = "S+T",
  TARGET = "T",
  STOP = "S",
}
interface RowData {
  secId: number;
  secCode: string;
  orderNum?: string;
  type: string;
  operation: OperationType;
  quantity: number;
  price: number;
  target?: number;
}

type Props = {};

const OrdersTable: React.FC<Props> = ({}) => {
  const dispatch = useAppDispatch();
  const { stops } = useAppSelector(selectStops);
  const { orders } = useAppSelector(selectOrders);

  const [row, setRow] = useState<RowData>();

  if (stops.length === 0 && orders.length === 0) {
    return <>No data</>;
  }

  const data: RowData[] = [];
  if (stops.length) {
    (stops as StopOrder[]).forEach(
      ({
        secId,
        secCode,
        operation,
        quantity,
        conditionPrice,
        number,
        kind,
        conditionPrice2,
      }) => {
        data.push({
          type:
            kind === StopOrderKind.SIMPLE_STOP_ORDER
              ? ControlOrderType.STOP
              : kind === StopOrderKind.TAKE_PROFIT_STOP_ORDER
              ? ControlOrderType.TARGET
              : ControlOrderType.STOP_TARGET,
          secCode,
          secId,
          operation,
          quantity,
          price:
            kind === StopOrderKind.TAKE_PROFIT_AND_STOP_LIMIT_ORDER
              ? conditionPrice2
              : conditionPrice,
          target:
            kind === StopOrderKind.TAKE_PROFIT_AND_STOP_LIMIT_ORDER
              ? conditionPrice
              : undefined,
          orderNum: "" + number,
        });
      }
    );
  }

  if (orders.length) {
    (orders as Order[]).forEach(
      ({ secCode, secId, operation, quantity, price, orderNum }) => {
        data.push({
          type: ControlOrderType.ORDER,
          secCode,
          secId,
          operation,
          quantity,
          price,
          orderNum,
        });
      }
    );
  }

  sortAlphabetically(data, "secCode");

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
      const newRow: RowData = e.value;
      setRow(newRow);
      if (newRow && newRow.secId !== row?.secId) {
        dispatch(setSecurityById(newRow.secId));
      } else {
        dispatch(setSecurityById(undefined));
      }
    }
  };

  // const valueTodayTemplate = (rowData, column) => {
  //   return formatNumber(rowData.valueToday);
  // };

  // const valueTodaySort = (e: any) => {
  //   if (e.order > 0) {
  //     return securities.sort((a, b) => a.valueToday - b.valueToday);
  //   }
  //   return securities.sort((a, b) => b.valueToday - a.valueToday);
  // };

  const deleteItem = ({ type, orderNum }: RowData) => {
    if (type === ControlOrderType.ORDER) {
      dispatch(deleteOrder(orderNum));
    } else {
      dispatch(deleteStop(parseInt(orderNum)));
    }
  };

  const actionsTemplate = (rowData, column) => {
    return (
      <div>
        <Button
          icon="pi pi-times"
          className="p-button-rounded p-button-danger p-button-text"
          onClick={() => deleteItem(rowData)}
        />
      </div>
    );
  };

  const headerGroup = (
    <ColumnGroup>
      <Row style={{ height: "10px" }}>
        <Column header="Sec" />
        <Column header="Type" />
        <Column header="Op" />
        <Column header="Qty" />
        <Column header="Pr/Stop" />
        <Column header="Target" />
        <Column header="Actions" />
        {/* <Column header="Оборот" sortable sortFunction={valueTodaySort} /> */}
      </Row>
    </ColumnGroup>
  );

  return (
    <DataTable
      value={data}
      selectionMode="single"
      metaKeySelection={false}
      selection={row}
      dataKey="orderNum"
      onSelectionChange={onSelect}
      className="active-trade-view OrdersTable"
      headerColumnGroup={headerGroup}
      rowClassName={rowClassName}
      virtualRowHeight={24}
      scrollable
      scrollHeight="400px"
    >
      <Column field="secCode" />
      <Column field="type" />
      <Column field="operation" />
      <Column field="quantity" />
      <Column field="price" />
      <Column field="target" />
      <Column body={actionsTemplate} />
      {/* <Column field="valueToday" body={valueTodayTemplate} /> */}
    </DataTable>
  );
};

export default OrdersTable;
