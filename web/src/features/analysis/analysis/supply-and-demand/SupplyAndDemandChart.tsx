import { Chart } from "primereact/chart";
import * as React from "react";
import { useEffect, useState } from "react";
import { OperationTypeColor } from "../../../../common/utils/utils";
import { SupplyAndDemandData } from "./SupplyAndDemandData";
import moment = require("moment");

type Props = {
  items: SupplyAndDemandData[];
  dateTimeFormat: string;
  title: string;
  windowSize: number;
  width: number;
  height: number;
};

export const SupplyAndDemandChart: React.FC<Props> = ({
  items,
  dateTimeFormat,
  title,
  windowSize,
  width,
  height,
}) => {

  const fizLongColor = OperationTypeColor.BUY;
  const fizShortColor = OperationTypeColor.SELL;

  const options = {
    title: {
      display: true,
      text: title,
      fontSize: 16,
    },
    legend: {
      position: "bottom",
    },
    animation: {
      duration: 0,
    },
  };
  const [data, setData] = useState(null);

  useEffect(() => {
    const startIndex = windowSize
      ? windowSize < items.length
        ? items.length - windowSize
        : 0
      : 0;
    const times = [];
    const totalDemands = [];
    const totalSupplies = [];
    for (let i = startIndex; i < items.length; i++) {
      times.push(moment(items[i].dateTime).format(dateTimeFormat));
      totalDemands.push(items[i].totalDemand);
      totalSupplies.push(items[i].totalSupply);
    }

    setData({
      labels: times,
      datasets: [
        {
          label: "Total Demand",
          data: totalDemands,
          fill: false,
          backgroundColor: fizLongColor,
          borderColor: fizLongColor,
        },
        {
          label: "Total Supply",
          data: totalSupplies,
          fill: false,
          backgroundColor: fizShortColor,
          borderColor: fizShortColor,
        },
      ],
    });
  }, [items]);

  if (!items || !items.length) return null;

  return (
    <>
      <Chart
        type="line"
        data={data}
        options={options}
        width={`${width}px`}
        height={`${height}px`}
      />
    </>
  );
};
