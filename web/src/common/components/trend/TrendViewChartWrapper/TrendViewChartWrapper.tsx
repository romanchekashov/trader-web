import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { filter } from "rxjs/internal/operators";
import { useAppDispatch } from "../../../../app/hooks";
import { addNewSignals } from "../../../../app/notifications/notificationsSlice";
import { setSecurityById } from "../../../../app/securities/securitiesSlice";
import analysisRestApi from "../../../api/rest/analysisRestApi";
import { WebsocketService, WSEvent } from "../../../api/WebsocketService";
import { BrokerId } from "../../../data/BrokerId";
import { Interval } from "../../../data/Interval";
import { Market } from "../../../data/Market";
import { SecurityLastInfo } from "../../../data/security/SecurityLastInfo";
import { SecurityType } from "../../../data/security/SecurityType";
import { Signal } from "../../../data/Signal";
import { SRLevel } from "../../../data/strategy/SRLevel";
import { TradePremise } from "../../../data/strategy/TradePremise";
import { Trend } from "../../../data/strategy/Trend";
import { TrendDirection } from "../../../data/strategy/TrendDirection";
import { TradeStrategyAnalysisFilterDto } from "../../../data/TradeStrategyAnalysisFilterDto";
import { TradingPlatform } from "../../../data/trading/TradingPlatform";
import { adjustTradePremise } from "../../../utils/DataUtils";
import {
  getRecentBusinessDate,
  TrendDirectionColor,
} from "../../../utils/utils";
import TrendViewChart from "../TrendViewChart";
import "./TrendViewChartWrapper.css";
import moment = require("moment");

type Props = {
  security: SecurityLastInfo;
  eachChartHeight?: number;
  timeFrame: Interval;
};

const TrendViewChartWrapper: React.FC<Props> = ({
  security,
  eachChartHeight = 300,
  timeFrame,
}) => {
  const dispatch = useAppDispatch();

  const ref = useRef(null);
  const [levels, setLevels] = useState<SRLevel[]>([]);
  const [trend, setTrend] = useState<Trend>();
  const [trends, setTrends] = useState<Trend[]>([]);
  // const [tradeStrategyAnalysisFilter, setTradeStrategyAnalysisFilter] = useState<TradeStrategyAnalysisFilterDto>();

  useEffect(() => {
    const tradeStrategyAnalysisFilter = {
      brokerId:
        security?.market === Market.SPB
          ? BrokerId.TINKOFF_INVEST
          : BrokerId.ALFA_DIRECT,
      tradingPlatform:
        security?.market === Market.SPB
          ? TradingPlatform.API
          : TradingPlatform.QUIK,
      secId: security?.id,
      timeFrameTrading: Interval.M3,
      timeFrameMin: Interval.M1,
    };

    fetchPremise(tradeStrategyAnalysisFilter);

    const tradePremiseSubscription = WebsocketService.getInstance()
      .on<TradePremise>(WSEvent.TRADE_PREMISE)
      .pipe(filter((premise) => premise.security.id === security?.id))
      .subscribe((newPremise) => {
        adjustTradePremise(newPremise);
        onTradePremiseRecieved(newPremise);
      });

    const wsStatusSub = WebsocketService.getInstance()
      .connectionStatus()
      .subscribe((isConnected) => {
        if (isConnected && security) {
          informServerAboutRequiredData(tradeStrategyAnalysisFilter);
        }
      });

    if (security) {
      informServerAboutRequiredData(tradeStrategyAnalysisFilter);
    }

    // Specify how to clean up after this effect:
    return function cleanup() {
      tradePremiseSubscription.unsubscribe();
      wsStatusSub.unsubscribe();
      WebsocketService.getInstance().send<TradeStrategyAnalysisFilterDto>(
        WSEvent.UNSUBSCRIBE_TRADE_PREMISE_AND_SETUP,
        tradeStrategyAnalysisFilter
      );
    };
  }, [security?.id, timeFrame]);

  const fetchPremise = (
    tradeStrategyAnalysisFilter: TradeStrategyAnalysisFilterDto
  ) => {
    analysisRestApi
      .getTradePremise({
        ...tradeStrategyAnalysisFilter,
        timestamp: getRecentBusinessDate(
          moment().hours(0).minutes(0).seconds(0).add(1, "days").toDate()
        ),
      })
      .then(onTradePremiseRecieved)
      .catch((reason) => {
        console.error(reason);
        fetchPremise(tradeStrategyAnalysisFilter);
      });
  };

  const onTradePremiseRecieved = (newPremise: TradePremise) => {
    const { trends, srLevels } = newPremise?.analysis;
    setTrend(
      filterTrendPoints(trends?.find(({ interval }) => interval === timeFrame))
    );
    setLevels(srLevels);
    if (security) {
      const intervals = new Set(
        security.type === SecurityType.FUTURE
          ? [Interval.DAY, Interval.M60, Interval.M5]
          : [Interval.MONTH, Interval.DAY, Interval.M60]
      );
      setTrends(trends.filter(({ interval }) => intervals.has(interval)));
    }

    const signals: Signal[] = [];
    newPremise.marketState.marketStateIntervals.forEach((o) =>
      o.items.forEach((item) => item.signals.forEach((s) => signals.push(s)))
    );
    dispatch(addNewSignals(signals));
  };

  const filterTrendPoints = (trend: Trend): Trend => {
    if (Interval.M3 === trend.interval || Interval.M5 === trend.interval) {
      const newTrend = { ...trend };
      const date =
        newTrend.swingHighsLows[
          newTrend.swingHighsLows.length - 1
        ].dateTime.getDate();
      newTrend.swingHighsLows = newTrend.swingHighsLows.filter(
        ({ dateTime }) => date === dateTime.getDate()
      );
      return newTrend;
    } else if (Interval.M60 === trend.interval) {
      const newTrend = { ...trend };
      const time = moment(
        newTrend.swingHighsLows[newTrend.swingHighsLows.length - 1].dateTime
      )
        .subtract(14, "days")
        .toDate()
        .getTime();
      newTrend.swingHighsLows = newTrend.swingHighsLows.filter(
        ({ dateTime }) => dateTime.getTime() > time
      );
      return newTrend;
    }

    return trend;
  };

  const informServerAboutRequiredData = (
    tradeStrategyAnalysisFilter: TradeStrategyAnalysisFilterDto
  ): void => {
    WebsocketService.getInstance().send<TradeStrategyAnalysisFilterDto>(
      WSEvent.SUBSCRIBE_TRADE_PREMISE_AND_SETUP,
      tradeStrategyAnalysisFilter
    );
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
              key={interval}
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
