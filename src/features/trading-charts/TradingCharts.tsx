import * as React from "react";
import {Route, Switch} from "react-router-dom";
import {TradingChartsPage} from "./TradingChartsPage";
import {TradingChartsSecurity} from "./TradingChartsSecurity";

export const TradingCharts = () => (
    <Switch>
        <Route exact path='/trading-charts' component={TradingChartsPage}/>
        <Route path='/trading-charts/:secId' component={TradingChartsSecurity}/>
    </Switch>
)