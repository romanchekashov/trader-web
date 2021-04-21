import * as React from "react";
import {HashRouter} from "react-router-dom";
import {render} from "react-dom";
import {App} from "./features/App";
import "./index.css";
import "./common/styles/common.css";

render(
    <HashRouter>
        <App />
    </HashRouter>,
  document.getElementById("app")
);
