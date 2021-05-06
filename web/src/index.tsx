import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import { App } from "./app/App";
import store from "./app/store";

import "primereact/resources/primereact.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./index.css";
import "./common/styles/common.css";

render(
  <ReduxProvider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ReduxProvider>,
  document.getElementById("app")
);
