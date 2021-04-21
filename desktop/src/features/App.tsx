import * as React from "react";
import {Route, Switch} from "react-router-dom";
import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/nova-light/theme.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import {Header} from "../components/Header";
import {Real} from "./real/Real";
import {History} from "./history/History";
import {Signal} from "./signal/Signal";

export const App = () => {
    return (
        <div className="container-fluid" style={{height: '100%'}}>
            <Header/>
            <Switch>
                <Route exact path="/" component={Real}/>
                <Route path="/history" component={History}/>
                <Route path="/signal" component={Signal}/>
            </Switch>
        </div>
    );
};