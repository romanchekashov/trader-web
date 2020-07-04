import * as React from "react";
import {Route, Switch} from "react-router-dom";
import {HomePage} from "../features/home/HomePage";
import {Header} from "../components/Header";
import {PageNotFound} from "./PageNotFound";
import TradeStrategyBotControlPage from "../features/bot-control/BotControlPage";
import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/nova-light/theme.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import TradeStrategyAnalysisPage from "../features/analysis/AnalysisPage";
import TradeJournalPage from "../features/trade-journal/TradeJournalPage";
import {ControlPanel} from "../common/components/control-panel/ControlPanel";
import {Stack} from "../common/components/stack/Stack";
import {BotControl} from "../common/components/bot-control/BotControl";
import {EconomicCalendarPage} from "../features/economic-calendar/EconomicCalendarPage";

export const App = () => {
    return (
        <div className="container-fluid">
            <ControlPanel/>
            <Stack/>
            <BotControl/>
            <Header/>
            <Switch>
                <Route exact path="/" component={HomePage}/>
                <Route path="/analysis" component={TradeStrategyAnalysisPage}/>
                <Route path="/bot-control" component={TradeStrategyBotControlPage}/>
                <Route path="/trade-journal" component={TradeJournalPage}/>
                <Route path="/economic-calendar" component={EconomicCalendarPage}/>
                <Route component={PageNotFound}/>
            </Switch>
        </div>
    );
};
