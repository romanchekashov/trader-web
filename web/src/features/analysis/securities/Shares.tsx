import * as React from "react";
import { useEffect } from "react";
import { SecurityShare } from "../../../common/data/security/SecurityShare";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { OperationType } from "../../../common/data/OperationType";
import { round100 } from "../../../common/utils/utils";

type Props = {
  shares: SecurityShare[];
  selectedShare: SecurityShare;
  onSelectRow: (e: any) => void;
};

const Shares: React.FC<Props> = ({ shares, selectedShare, onSelectRow }) => {
  const columns = [
    { field: "shortName", header: "Наз" },
    { field: "lastChange", header: "% изм" },
    { field: "lastTradePrice", header: "Цен посл" },
    { field: "lastTradeQuantity", header: "Кол-во посл" },
    { field: "lotSize", header: "Лот" },
    { field: "issueSize", header: "Объем обр." },
    { field: "voltoday", header: "Общее кол-во" },
    { field: "weightedAveragePrice", header: "Ср. взв. цена" },
    { field: "valueToday", header: "Оборот" },
    { field: "numTradesToday", header: "Кол-во сделок" },
    { field: "percentOfFreeFloatTradedToday", header: "% FreeFlt Traded" },
  ];

  const lessColumns = [
    { field: "shortName", header: "Наз" },
    { field: "lastChange", header: "% изм" },
    { field: "numTradesToday", header: "Кол-во сделок" },
  ];

  useEffect(() => {});

  const selectedColumns = selectedShare ? lessColumns : columns;
  const columnComponents = selectedColumns.map((col) => {
    return (
      <Column
        key={col.field}
        field={col.field}
        header={col.header}
        sortable={true}
        filter={true}
      />
    );
  });

  const onSelect = (e) => {
    if (!Array.isArray(e.value)) {
      console.log(e.value);
      onSelectRow(e.value);
    }
  };

  return (
    <DataTable
      value={shares}
      selectionMode="single"
      selection={selectedShare}
      onSelectionChange={onSelect}
      scrollable={!!selectedShare}
      scrollHeight="600px"
    >
      {columnComponents}
    </DataTable>
  );
};

export default Shares;
