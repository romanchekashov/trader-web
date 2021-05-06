import * as React from "react";
import { Route, Switch } from "react-router-dom";
import { HomePage } from "../features/home/HomePage";
import { Header } from "../components/Header";
import { PageNotFound } from "./PageNotFound";
import TradeStrategyAnalysisPage from "../features/analysis/AnalysisPage";
import TradeJournalPage from "../features/trade-journal/TradeJournalPage";
import { EconomicCalendarPage } from "../features/economic-calendar/EconomicCalendarPage";
import { NewsPage } from "../features/news/NewsPage";
import { TradingChartsRouter } from "../features/trading-charts/TradingChartsRouter";
import { BotControlPage } from "../features/bot-control/BotControlPage";
import { ActiveTradesPage } from "../features/active-trades/ActiveTradesPage";
import { StackWrapper } from "../common/components/stack/StackWrapper";
import Widgetbar from "../common/components/widgetbar/Widgetbar";
import { useState } from "react";

export const App = () => {
  const [widgetbarHeight, setWidgetbarHeight] = useState<number>(50);

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
          <Route path="/analysis" component={TradeStrategyAnalysisPage} />
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
