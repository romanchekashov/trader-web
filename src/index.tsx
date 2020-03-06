import * as React from "react";
import {render} from "react-dom";
import {BrowserRouter} from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import {App} from "./app/App";
import store from "./app/store";
import "./index.css";

render(
    <ReduxProvider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </ReduxProvider>,
    document.getElementById("app")
);