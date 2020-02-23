import * as React from "react";
import { Route, Switch } from "react-router-dom";
import {AnalysisPage} from "../features/analysis/AnalysisPage";
import {Header} from "../common/Header";
import {PageNotFound} from "./PageNotFound";

export const App = () => {
    return (
        <div className="container-fluid">
            <Header />
            <Switch>
                <Route exact path="/" component={AnalysisPage} />
                <Route component={PageNotFound} />
            </Switch>
        </div>
    );
};
