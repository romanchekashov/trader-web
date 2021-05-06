import * as React from "react";
import { useEffect, useState } from "react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { SecurityLastInfo } from "../../common/data/security/SecurityLastInfo";
import { round100 } from "../../common/utils/utils";

type Props = {
  securities: SecurityLastInfo[];
  onSelectRow: (e: any) => void;
};

export const TradingChartsSecurities: React.FC<Props> = ({
  securities,
  onSelectRow,
}) => {
  const columns = [
    { field: "shortName", header: "Наз" },
    { field: "lastChange", header: "% изм" },
    { field: "lastTradePrice", header: "Цен посл" },
    { field: "totalDemand", header: "Об спр/пред" },
    { field: "valueToday", header: "Оборот" },
    { field: "numTradesToday", header: "Кол сдел" },
  ];

  const [securityLastInfo, setSecurityLastInfo] = useState<SecurityLastInfo>(
    null
  );

  useEffect(() => {});

  const demandSupplyTemplate = (rowData, column) => {
    const totalDemand: number = rowData.totalDemand;
    const totalSupply: number = rowData.totalSupply;
    const sum = totalDemand + totalSupply;
    const demandWidth = (totalDemand * 100) / sum;
    const supplyWidth = 100 - demandWidth;
    const ratio = round100(totalDemand / totalSupply);

    return (
      <div
        className="demand-supply"
        title={`Общ спрос: ${totalDemand} / Общ предл: ${totalSupply} = ${ratio}`}
      >
        <div className="demand" style={{ width: demandWidth + "%" }}></div>
        <div className="supply" style={{ width: supplyWidth + "%" }}></div>
      </div>
    );
  };

  const demandSupplySort = (e: any) => {
    if (e.order > 0) {
      return securities.sort(
        (a, b) => a.totalDemand / a.totalSupply - b.totalDemand / b.totalSupply
      );
    }
    return securities.sort(
      (a, b) => b.totalDemand / b.totalSupply - a.totalDemand / a.totalSupply
    );
  };

  const columnComponents = columns.map((col) => {
    if ("totalDemand" === col.field) {
      return (
        <Column
          key={col.field}
          field={col.field}
          header={col.header}
          sortable={true}
          body={demandSupplyTemplate}
          sortFunction={demandSupplySort}
          style={{ width: "100px" }}
        />
      );
    }
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
      setSecurityLastInfo(e.value);
      onSelectRow(e.value);
    }
  };

  return (
    <div className="p-grid analysis-securities">
      <DataTable
        value={securities}
        selectionMode="single"
        selection={securityLastInfo}
        onSelectionChange={onSelect}
        scrollable={true}
        scrollHeight="350px"
      >
        {columnComponents}
      </DataTable>
    </div>
  );
};
