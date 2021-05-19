import * as React from "react";
import { memo, useEffect, useRef, useState } from "react";
import { ClassCode } from "../../../data/ClassCode";
import { Interval } from "../../../data/Interval";
import { Security } from "../../../data/security/Security";
import { SRLevel } from "../../../data/strategy/SRLevel";
import { TradePremise } from "../../../data/strategy/TradePremise";
import { Trend } from "../../../data/strategy/Trend";
import { CHART_MIN_WIDTH } from "../../chart/ChartWrapper";
import TrendViewChart from "../TrendViewChart";
import "./TrendViewCharts.css";
import moment = require("moment");

type Props = {
  premise: TradePremise;
  security: Security;
  eachChartWidth?: number;
};

const TrendViewCharts: React.FC<Props> = ({
  premise,
  security,
  eachChartWidth = 360,
}) => {
  const [levels, setLevels] = useState<SRLevel[]>([]);

  const [trend1, setTrend1] = useState<Trend>();
  const chart1Ref1 = useRef(null);
  const [chart1Width1, setChart1Width1] = useState<number>(CHART_MIN_WIDTH);
  const [timeFrame1, setTimeFrame1] = useState<Interval>(Interval.DAY);

  const [trend2, setTrend2] = useState<Trend>();
  const chart2Ref1 = useRef(null);
  const [chart2Width1, setChart2Width1] = useState<number>(CHART_MIN_WIDTH);
  const [timeFrame2, setTimeFrame2] = useState<Interval>(Interval.M30);

  const [trend3, setTrend3] = useState<Trend>();
  const chart3Ref1 = useRef(null);
  const [chart3Width1, setChart3Width1] = useState<number>(CHART_MIN_WIDTH);
  const [timeFrame3, setTimeFrame3] = useState<Interval>(Interval.M3);

  useEffect(() => {
    setTimeout(updateSize, 1000);
    window.addEventListener("resize", updateSize);

    // Specify how to clean up after this effect:
    return function cleanup() {
      window.removeEventListener("resize", updateSize);
    };
  }, [security?.id]);

  useEffect(() => {
    if (!premise) return;

    console.log("TrendViewCharts: ", premise.security.code);

    const { analysis } = premise;

    setLevels(analysis?.srLevels);

    let timeFrame1 = Interval.MONTH;
    let timeFrame2 = Interval.DAY;
    let timeFrame3 = Interval.M60;
    if (ClassCode.SPBFUT === security?.classCode) {
      timeFrame1 = Interval.DAY;
      timeFrame2 = Interval.M30;
      timeFrame3 = Interval.M3;
    }
    setTimeFrame1(timeFrame1);
    setTimeFrame2(timeFrame2);
    setTimeFrame3(timeFrame3);

    setTrend1(analysis?.trends?.find((value) => value.interval === timeFrame1));
    setTrend2(analysis?.trends?.find((value) => value.interval === timeFrame2));
    setTrend3(
      filterTrendPoints(
        analysis?.trends?.find((value) => value.interval === timeFrame3)
      )
    );
  }, [premise]);

  const filterTrendPoints = (trend: Trend): Trend => {
    if (Interval.M3 !== trend.interval && Interval.M5 !== trend.interval)
      return trend;

    const newTrend = { ...trend };
    const date =
      newTrend.swingHighsLows[
        newTrend.swingHighsLows.length - 1
      ].dateTime.getDate();
    newTrend.swingHighsLows = newTrend.swingHighsLows.filter(
      ({ dateTime }) => date === dateTime.getDate()
    );
    return newTrend;
  };

  const updateSize = () => {
    const offset = 10;

    setChart1Width1(
      chart1Ref1.current
        ? chart1Ref1.current.clientWidth - offset
        : CHART_MIN_WIDTH
    );
    setChart2Width1(
      chart2Ref1.current
        ? chart2Ref1.current.clientWidth - offset
        : CHART_MIN_WIDTH
    );
    setChart3Width1(
      chart3Ref1.current
        ? chart3Ref1.current.clientWidth - offset
        : CHART_MIN_WIDTH
    );
  };

  if (!premise) return <div>Select security for trend analysis</div>;

  return (
    <div key={security?.id} className="p-grid">
      <div className="p-col-4" ref={chart1Ref1} style={{ padding: "0" }}>
        <TrendViewChart
          key={timeFrame1}
          trend={trend1}
          srLevels={levels}
          width={eachChartWidth}
          height={600}
        />
      </div>
      <div className="p-col-4" ref={chart2Ref1} style={{ padding: "0" }}>
        <TrendViewChart
          key={timeFrame2}
          trend={trend2}
          srLevels={levels}
          width={eachChartWidth}
          height={600}
        />
      </div>
      <div className="p-col-4" ref={chart3Ref1} style={{ padding: "0" }}>
        <TrendViewChart
          key={timeFrame3}
          trend={trend3}
          srLevels={levels}
          width={eachChartWidth}
          height={600}
        />
      </div>
    </div>
  );
};

const areEqual = (prevProps, nextProps) => {
  return prevProps.premise?.security?.id === nextProps.premise?.security?.id;
};

export default memo(TrendViewCharts);
