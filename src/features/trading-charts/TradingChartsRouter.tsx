import * as React from "react";
import {Route, Switch} from "react-router-dom";
import {TradingChartsPage} from "./TradingChartsPage";
import {TradingChartsSecurity} from "./security/TradingChartsSecurity";

export const TradingChartsRouter = () => (
    <Switch>
        <Route exact path='/trading-charts' component={TradingChartsPage}/>
        <Route path='/trading-charts/:secId/premise-start/:premiseStart' component={TradingChartsSecurity}/>
        <Route path='/trading-charts/:secId' component={TradingChartsSecurity}/>
    </Switch>
)