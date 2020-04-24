import * as React from "react";
import {Route, Switch} from "react-router-dom";
import {HomePage} from "../features/home/HomePage";
import {Header} from "../components/Header";
import {PageNotFound} from "./PageNotFound";
import TradeStrategyBotControlPage from "../features/bot-control/TradeStrategyBotControlPage";
import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/nova-light/theme.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import TradeStrategyAnalysisPage from "../features/tradestrategyanalysis/TradeStrategyAnalysisPage";
import TradeJournalPage from "../features/tradejournal/TradeJournalPage";

export const App = () => {
    return (
        <div className="container-fluid">
            <Header/>
            <Switch>
                <Route exact path="/" component={HomePage}/>
                <Route path="/trade-strategy-analysis" component={TradeStrategyAnalysisPage}/>
                <Route path="/trade-strategy-bot-control" component={TradeStrategyBotControlPage}/>
                <Route path="/trade-journal" component={TradeJournalPage}/>
                <Route component={PageNotFound}/>
            </Switch>
        </div>
    );
};
