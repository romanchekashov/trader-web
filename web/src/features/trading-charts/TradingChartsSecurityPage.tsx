import * as React from "react";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { map } from "rxjs/internal/operators/map";
import securitiesApi from "../../app/securities/securitiesApi";
import { WebsocketService, WSEvent } from "../../common/api/WebsocketService";
import { SecurityLastInfo } from "../../common/data/security/SecurityLastInfo";
import { TradingChartsSecurity } from "./security/TradingChartsSecurity";
import moment = require("moment");

type RouteParams = {
  secId: string;
  premiseStart: string;
};

export const TradingChartsSecurityPage: React.FC<
  RouteComponentProps<RouteParams>
> = ({ match }) => {
  const secId: number = parseInt(match.params.secId);
  const start = match.params.premiseStart
    ? moment(match.params.premiseStart, "DD-MM-YYYY_HH-mm").toDate()
    : null;

  const [securityLastInfo, setSecurityLastInfo] =
    useState<SecurityLastInfo>(null);

  useEffect(() => {
    document.getElementById("main-nav").style.display = "none";

    securitiesApi.getLastSecurities(secId).then((securities) => {
      const security = securities.find((value) => value.id === secId);
      if (security) {
        setSecurityLastInfo(security);
      }
    });

    const lastSecuritiesSubscription = WebsocketService.getInstance()
      .on<SecurityLastInfo[]>(WSEvent.LAST_SECURITIES)
      .pipe(
        map((securities) =>
          securities.find((security) => security.id === secId)
        )
      )
      .subscribe((security) => {
        document.title = `${security.secCode} - ${security.lastChange}% - ${security.lastTradePrice}`;
        setSecurityLastInfo(security);
      });

    // Specify how to clean up after this effect:
    return function cleanup() {
      lastSecuritiesSubscription.unsubscribe();
    };
  }, []);

  if (!securityLastInfo) return <div>No Data</div>;

  return (
    <TradingChartsSecurity
      securityLastInfo={securityLastInfo}
      start={start}
      layout={1}
    />
  );
};
