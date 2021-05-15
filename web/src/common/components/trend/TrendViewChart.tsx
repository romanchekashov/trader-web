import { Chart } from "primereact/chart";
import * as React from "react";
import { useEffect, useState } from "react";
import { Interval } from "../../data/Interval";
import { SRLevel } from "../../data/strategy/SRLevel";
import { SrLevelType } from "../../data/strategy/SrLevelType";
import { Trend } from "../../data/strategy/Trend";
import { TrendDirection } from "../../data/strategy/TrendDirection";
import intervalCompare from "../../utils/IntervalComporator";
import { TrendDirectionColor } from "../../utils/utils";
import "./TrendView.css";
import moment = require("moment");

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
  const TODAY_COLOR = "#f44336";
  const options = {
    title: {
      display: true,
      fontSize: 12,
    },
    animation: {
      duration: 0,
    },
  };

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
        label: `${makeShort(lvl.type)}(${intervalShortName[lvl.interval]}): ${
          lvl.swingHL
        }`,
        data: Array(trend.swingHighsLows.length).fill(
          lvl.swingHL,
          0,
          trend.swingHighsLows.length
        ),
        fill: false,
        borderColor:
          lvl.type === SrLevelType.TODAY_HIGH ||
          lvl.type === SrLevelType.TODAY_LOW
            ? TODAY_COLOR
            : "#FFA726",
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

  let levels: SRLevel[] = [];
  if (srLevels?.length) {
    const INTERVAL =
      intervalCompare(trend.interval, Interval.M60) < 0
        ? Interval.DAY
        : intervalCompare(trend.interval, Interval.H4) < 0
        ? Interval.WEEK
        : Interval.MONTH;
    levels = srLevels.filter((value) => value.interval === INTERVAL);
  }

  const data = updateData(trend, levels);

  return (
    <Chart
      type="line"
      data={data}
      options={options}
      width={width + "px"}
      height={height + "px"}
    />
  );
};

export default TrendViewChart;
