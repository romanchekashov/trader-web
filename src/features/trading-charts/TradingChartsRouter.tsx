import * as React from "react";
import { Route, Switch } from "react-router-dom";
import { TradingChartsPage } from "./TradingChartsPage";
import { TradingChartsSecurityPage } from "./TradingChartsSecurityPage";

export const TradingChartsRouter = () => (
    <Switch>
        <Route exact path='/trading-charts' component={TradingChartsPage} />
        <Route path='/trading-charts/:secId/premise-start/:premiseStart' component={TradingChartsSecurityPage} />
        <Route path='/trading-charts/:secId' component={TradingChartsSecurityPage} />
    </Switch>
)