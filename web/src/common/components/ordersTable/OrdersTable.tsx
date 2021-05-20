import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { DataTable } from "primereact/datatable";
import { Row } from "primereact/row";
import * as React from "react";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { deleteStop, selectStops } from "../../../app/stops/stopsSlice";
import { OperationType } from "../../data/OperationType";
import { StopOrder } from "../../data/StopOrder";
import "./OrdersTable.css";

interface RowData {
  orderNum?: number;
  secCode: string;
  operation: OperationType;
  quantity: number;
  price: number;
}

type Props = {};

const OrdersTable: React.FC<Props> = ({}) => {
  const dispatch = useAppDispatch();
  const { stops } = useAppSelector(selectStops);

  const [row, setRow] = useState<RowData>();

  if (stops.length === 0) {
    return <>No data</>;
  }

  const data: RowData[] = [];
  if (stops.length) {
    (stops as StopOrder[]).forEach(
      ({ secCode, operation, quantity, conditionPrice, number }) => {
        data.push({
          secCode,
          operation,
          quantity,
          price: conditionPrice,
          orderNum: number,
        });
      }
    );
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
      const sec: RowData = e.value;
      setRow(sec);
      // if (sec && sec.id !== security?.id) {
      //   dispatch(setSecurityById(sec.id));
      // } else {
      //   dispatch(setSecurityById(undefined));
      // }
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

  const deleteOrder = (row: RowData) => {
    if (row.orderNum) dispatch(deleteStop(row.orderNum));
  };

  const actionsTemplate = (rowData, column) => {
    return (
      <div>
        <Button
          icon="pi pi-times"
          className="p-button-rounded p-button-danger p-button-text"
          onClick={() => deleteOrder(rowData)}
        />
      </div>
    );
  };

  const headerGroup = (
    <ColumnGroup>
      <Row style={{ height: "10px" }}>
        <Column header="SecCode" />
        <Column header="operation" />
        <Column header="quantity" />
        <Column header="price" />
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
      dataKey="id"
      onSelectionChange={onSelect}
      className="active-trade-view OrdersTable"
      headerColumnGroup={headerGroup}
      rowClassName={rowClassName}
      virtualRowHeight={24}
      scrollable
      scrollHeight="400px"
    >
      <Column field="secCode" />
      <Column field="operation" />
      <Column field="quantity" />
      <Column field="price" />
      <Column body={actionsTemplate} />
      {/* <Column field="valueToday" body={valueTodayTemplate} /> */}
    </DataTable>
  );
};

export default OrdersTable;
