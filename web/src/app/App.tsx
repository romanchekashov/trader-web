import * as React from "react";
import { useEffect, useState } from "react";
import { Route, Switch } from "react-router-dom";
import { WebsocketService, WSEvent } from "../common/api/WebsocketService";
import { StackWrapper } from "../common/components/stack/StackWrapper";
import Widgetbar from "../common/components/widgetbar/Widgetbar";
import { ActiveTrade } from "../common/data/ActiveTrade";
import { BrokerId } from "../common/data/BrokerId";
import { StopOrder } from "../common/data/StopOrder";
import { TradingPlatform } from "../common/data/trading/TradingPlatform";
import { Header } from "../components/Header";
import { ActiveTradesPage } from "../features/active-trades/ActiveTradesPage";
import AnalysisPage from "../features/analysis/AnalysisPage";
import { BotControlPage } from "../features/bot-control/BotControlPage";
import { EconomicCalendarPage } from "../features/economic-calendar/EconomicCalendarPage";
import { HomePage } from "../features/home/HomePage";
import { NewsPage } from "../features/news/NewsPage";
import TradeJournalPage from "../features/trade-journal/TradeJournalPage";
import { TradingChartsRouter } from "../features/trading-charts/TradingChartsRouter";
import {
  loadActiveTrades,
  setActiveTrades,
} from "./activeTrades/activeTradesSlice";
import { useAppDispatch } from "./hooks";
import { PageNotFound } from "./PageNotFound";
import { loadPossibleTradesStat } from "./possibleTrades/possibleTradesSlice";
import {
  loadCurrencies,
  loadFutures,
  loadShares,
} from "./securities/securitiesSlice";
import { setStops } from "./stops/stopsSlice";

export const App = () => {
  const dispatch = useAppDispatch();
  const [widgetbarHeight, setWidgetbarHeight] = useState<number>(50);

  useEffect(() => {
    dispatch(loadShares());
    dispatch(loadFutures());
    dispatch(loadCurrencies());
    dispatch(loadActiveTrades());
    dispatch(
      loadPossibleTradesStat({
        brokerId: BrokerId.ALFA_DIRECT,
        tradingPlatform: TradingPlatform.QUIK,
        fetchByWS: false,
        history: true,
        all: false,
        secId: null,
      })
    );

    const stopOrdersSubscription = WebsocketService.getInstance()
      .on<StopOrder[]>(WSEvent.STOP_ORDERS)
      .subscribe((newStopOrders) => {
        dispatch(setStops(newStopOrders));
      });

    const activeTradeSubscription = WebsocketService.getInstance()
      .on<ActiveTrade[]>(WSEvent.ACTIVE_TRADES)
      .subscribe((activeTrades) => {
        dispatch(setActiveTrades(activeTrades));
      });

    const wsStatusSub = WebsocketService.getInstance()
      .connectionStatus()
      .subscribe((isConnected) => {
        if (isConnected) {
          console.log("isConnected");
        }
      });
    // Specify how to clean up after this effect:
    return function cleanup() {
      stopOrdersSubscription.unsubscribe();
      activeTradeSubscription.unsubscribe();
      wsStatusSub.unsubscribe();
    };
  }, []);

  return (
    <div className="container-fluid">
      <div style={{ width: `-webkit-calc(100% - ${widgetbarHeight}px)` }}>
        {/*<ControlPanel/>*/}
        <StackWrapper />
        {/*<BotControl/>*/}
        <Header />
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route path="/news" component={NewsPage} />
          <Route path="/active-trades" component={ActiveTradesPage} />
          <Route path="/analysis" component={AnalysisPage} />
          <Route path="/trading-charts" component={TradingChartsRouter} />
          <Route path="/bot-control" component={BotControlPage} />
          <Route path="/trade-journal" component={TradeJournalPage} />
          <Route path="/economic-calendar" component={EconomicCalendarPage} />
          <Route component={PageNotFound} />
        </Switch>
      </div>
      <Widgetbar width={widgetbarHeight} onWidthChange={setWidgetbarHeight} />
    </div>
  );
};
