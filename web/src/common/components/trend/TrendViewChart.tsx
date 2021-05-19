import { Chart } from "primereact/chart";
import * as React from "react";
import { Interval } from "../../data/Interval";
import { SRLevel } from "../../data/strategy/SRLevel";
import { SrLevelType } from "../../data/strategy/SrLevelType";
import { Trend } from "../../data/strategy/Trend";
import { TrendDirection } from "../../data/strategy/TrendDirection";
import { IntervalColor, TrendDirectionColor } from "../../utils/utils";
import "./TrendView.css";
import moment = require("moment");

const intervalShortName = {
  MONTH: "MN",
  WEEK: "W",
  DAY: "D",
};
const intervalDateTimeFormat = {
  MONTH: "DD-MM-YYYY",
  WEEK: "DD-MM-YYYY",
  DAY: "DD-MM-YYYY",
  M5: "HH:mm",
  M3: "HH:mm",
  M1: "HH:mm",
};
const options = {
  title: {
    display: true,
    fontSize: 12,
  },
  animation: {
    duration: 0,
  },
  legend: {
    display: false,
  },
};

type Props = {
  trend: Trend;
  srLevels: SRLevel[];
  width: number;
  height: number;
};

const TrendViewChart: React.FC<Props> = ({
  trend,
  srLevels,
  width,
  height,
}) => {
  const getColor = (direction: TrendDirection) => {
    return TrendDirectionColor[direction] || "#3f51b5";
  };

  const makeShort = (type: SrLevelType): string => {
    if (!type) return "";
    const arr = type.split("_");
    return arr[0][0] + arr[1][0];
  };

  const updateData = (trend: Trend, levels: SRLevel[]): any => {
    const color = getColor(trend.direction);
    const dateTimeFormat =
      intervalDateTimeFormat[trend.interval] || "DD.MM/HH:mm";
    const datasets = [];

    datasets.push({
      label: `${trend.interval} - Trend ${trend.direction} - ${trend.power}`,
      data: trend.swingHighsLows.map((value) => value.swingHL),
      fill: false,
      backgroundColor: color,
      borderColor: color,
    });

    for (let lvl of levels) {
      datasets.push({
        label: `${lvl.type}(${intervalShortName[lvl.interval]}): ${
          lvl.swingHL
        }`,
        data: Array(trend.swingHighsLows.length).fill(
          lvl.swingHL,
          0,
          trend.swingHighsLows.length
        ),
        fill: false,
        borderColor: IntervalColor[lvl.interval],
      });
    }

    return {
      labels: trend.swingHighsLows.map((value) =>
        moment(value.dateTime).format(dateTimeFormat)
      ),
      datasets,
    };
  };

  if (!trend) return <div>Select security for trend analysis</div>;

  let max = trend.swingHighsLows[0].swingHL;
  let min = trend.swingHighsLows[0].swingHL;

  for (const d of trend.swingHighsLows) {
    if (d.swingHL > max) max = d.swingHL;
    if (d.swingHL < min) min = d.swingHL;
  }

  let levels: SRLevel[] = [];
  if (srLevels?.length) {
    levels = srLevels.filter(
      (value) => value.swingHL >= min && value.swingHL <= max
    );
  }

  const data = updateData(trend, levels);

  return (
    <div className="TrendViewChart" style={{ height, width }}>
      <div className="TrendViewChart_title">
        {trend.interval} - {trend.power} Trend {trend.direction} | Levels:{" "}
        <span
          className="dot"
          style={{ border: `5px solid ${IntervalColor[Interval.MONTH]}` }}
        ></span>{" "}
        MN{" "}
        <span
          className="dot"
          style={{ border: `5px solid ${IntervalColor[Interval.WEEK]}` }}
        ></span>{" "}
        W{" "}
        <span
          className="dot"
          style={{ border: `5px solid ${IntervalColor[Interval.DAY]}` }}
        ></span>{" "}
        D
      </div>
      <Chart
        type="line"
        data={data}
        options={options}
        width={width + "px"}
        height={height - 20 + "px"}
      />
    </div>
  );
};

export default TrendViewChart;
