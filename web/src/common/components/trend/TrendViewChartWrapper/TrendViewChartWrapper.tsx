import * as React from "react";
import { useEffect, useState } from "react";
import { WebsocketService, WSEvent } from "../../../api/WebsocketService";
import { BrokerId } from "../../../data/BrokerId";
import { Interval } from "../../../data/Interval";
import { Market } from "../../../data/Market";
import { SecurityLastInfo } from "../../../data/security/SecurityLastInfo";
import { SRLevel } from "../../../data/strategy/SRLevel";
import { TradePremise } from "../../../data/strategy/TradePremise";
import { Trend } from "../../../data/strategy/Trend";
import { TradeStrategyAnalysisFilterDto } from "../../../data/TradeStrategyAnalysisFilterDto";
import { TradingPlatform } from "../../../data/trading/TradingPlatform";
import TrendViewChart from "../TrendViewChart";
import "./TrendViewChartWrapper.css";
import moment = require("moment");
import { adjustTradePremise } from "../../../utils/DataUtils";
import { filter } from "rxjs/internal/operators";
import { useRef } from "react";
import { ClassCode } from "../../../data/ClassCode";
import { TrendDirection } from "../../../data/strategy/TrendDirection";
import { TrendDirectionColor } from "../../../utils/utils";
import { useAppDispatch } from "../../../../app/hooks";
import { setSecurityById } from "../../../../app/securities/securitiesSlice";

type Props = {
  security: SecurityLastInfo;
  eachChartHeight?: number;
};

const TrendViewChartWrapper: React.FC<Props> = ({
  security,
  eachChartHeight = 300,
}) => {
  const dispatch = useAppDispatch();

  const ref = useRef(null);
  const [levels, setLevels] = useState<SRLevel[]>([]);
  const [trend, setTrend] = useState<Trend>();
  const [trends, setTrends] = useState<Trend[]>([]);

  useEffect(() => {
    const tradePremiseSubscription = WebsocketService.getInstance()
      .on<TradePremise>(WSEvent.TRADE_PREMISE)
      .pipe(filter((premise) => premise.security.id === security?.id))
      .subscribe((newPremise) => {
        adjustTradePremise(newPremise);
        const { trends, srLevels } = newPremise?.analysis;
        setTrend(
          filterTrendPoints(
            trends?.find((value) => value.interval === Interval.M5)
          )
        );
        setLevels(srLevels);
        if (security) {
          const intervals = new Set(
            ClassCode.SPBFUT === security.classCode
              ? [Interval.DAY, Interval.M60, Interval.M5]
              : [Interval.MONTH, Interval.DAY, Interval.M60]
          );
          setTrends(trends.filter(({ interval }) => intervals.has(interval)));
        }
      });

    const wsStatusSub = WebsocketService.getInstance()
      .connectionStatus()
      .subscribe((isConnected) => {
        if (isConnected && security) {
          informServerAboutRequiredData();
        }
      });

    if (security) {
      informServerAboutRequiredData();
    }

    // Specify how to clean up after this effect:
    return function cleanup() {
      tradePremiseSubscription.unsubscribe();
    };
  }, [security?.id]);

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

  const informServerAboutRequiredData = (): void => {
    if (security) {
      WebsocketService.getInstance().send<TradeStrategyAnalysisFilterDto>(
        WSEvent.GET_TRADE_PREMISE_AND_SETUP,
        {
          brokerId:
            security.market === Market.SPB
              ? BrokerId.TINKOFF_INVEST
              : BrokerId.ALFA_DIRECT,
          tradingPlatform:
            security.market === Market.SPB
              ? TradingPlatform.API
              : TradingPlatform.QUIK,
          secId: security.id,
          timeFrameTrading: Interval.M3,
          timeFrameMin: Interval.M1,
        }
      );
      // WebsocketService.getInstance().send<string>(
      //   WSEvent.GET_TRADES_AND_ORDERS,
      //   security.secCode
      // );
    }
  };

  const getColor = (direction: TrendDirection) => {
    return TrendDirectionColor[direction] || "#3f51b5";
  };

  return (
    <div
      ref={ref}
      className="TrendViewChartWrapper"
      style={{ height: eachChartHeight }}
    >
      <div className="TrendViewChartWrapper_title">
        <div
          className="TrendViewChartWrapper_title_sec"
          onClick={() => dispatch(setSecurityById(security?.id))}
        >
          {security?.shortName}
        </div>
        {trends.map(({ interval, direction }) => {
          return (
            <div
              className="TrendViewChartWrapper_title_trend"
              style={{ backgroundColor: getColor(direction) }}
            >
              {`${interval} - ${direction}`}
            </div>
          );
        })}
      </div>
      <TrendViewChart
        trend={trend}
        srLevels={levels}
        width={ref?.current?.clientWidth || 200}
        height={eachChartHeight - 20}
      />
    </div>
  );
};

export default TrendViewChartWrapper;
