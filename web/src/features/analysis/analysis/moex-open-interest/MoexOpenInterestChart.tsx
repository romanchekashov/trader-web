import * as React from "react";
import { useEffect, useState } from "react";
import { Chart } from "primereact/chart";
import { ClientGroup } from "../../../../common/data/open-interest/ClientGroup";
import { MoexOpenInterest } from "../../../../common/data/open-interest/MoexOpenInterest";
import moment = require("moment");
import { OperationTypeColor } from "../../../../common/utils/utils";

export const fizLongColor = OperationTypeColor.BUY;
export const fizShortColor = OperationTypeColor.SELL;
export const yurLongColor = "#1a237e";
export const yurShortColor = "#870000";

type Props = {
  moexOpenInterests: MoexOpenInterest[];
  dateTimeFormat: string;
  title: string;
  width: number;
  height: number;
};

export const MoexOpenInterestChart: React.FC<Props> = ({
  moexOpenInterests,
  dateTimeFormat,
  title,
  width,
  height,
}) => {
  if (!moexOpenInterests || moexOpenInterests.length == 0) return null;

  const options = {
    title: {
      display: true,
      text: title,
      fontSize: 16,
    },
    legend: {
      //   position: "bottom",
    },
  };
  const [data, setData] = useState(null);

  useEffect(() => {
    setData({
      labels: moexOpenInterests.map((value) =>
        moment(value.dateTime).format(dateTimeFormat)
      ),
      datasets: [
        {
          label: ClientGroup.FIZ + " LON",
          data: moexOpenInterests.map((value) => value.fizPosLong),
          fill: false,
          backgroundColor: fizLongColor,
          borderColor: fizLongColor,
        },
        {
          label: ClientGroup.FIZ + " SHO",
          data: moexOpenInterests.map((value) => value.fizPosShort),
          fill: false,
          backgroundColor: fizShortColor,
          borderColor: fizShortColor,
        },
        {
          label: ClientGroup.YUR + " LON",
          data: moexOpenInterests.map((value) => value.yurPosLong),
          fill: false,
          backgroundColor: yurLongColor,
          borderColor: yurLongColor,
        },
        {
          label: ClientGroup.YUR + " SHO",
          data: moexOpenInterests.map((value) => value.yurPosShort),
          fill: false,
          backgroundColor: yurShortColor,
          borderColor: yurShortColor,
        },
      ],
    });
  }, [moexOpenInterests]);

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
