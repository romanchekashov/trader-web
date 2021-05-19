import * as React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  loadLastSecurities,
  selectSecurities,
  setSecurities,
} from "../../app/securities/securitiesSlice";
import { WebsocketService, WSEvent } from "../../common/api/WebsocketService";
import TrendViewChartWrapper from "../../common/components/trend/TrendViewChartWrapper/TrendViewChartWrapper";
import { ClassCode } from "../../common/data/ClassCode";
import { SecurityLastInfo } from "../../common/data/security/SecurityLastInfo";
import { loadFilterData } from "../analysis/AnalysisSlice";
import "./TrendChartsPage.css";

type Props = {};

const TrendChartsPage: React.FC<Props> = ({}) => {
  const dispatch = useAppDispatch();
  const { securities } = useAppSelector(selectSecurities);

  const [height, setHeight] = useState<number>(800);

  useEffect(() => {
    updateSize();
    window.addEventListener("resize", updateSize);

    dispatch(loadFilterData(false));
    dispatch(loadLastSecurities());
    const lastSecuritiesSubscription = WebsocketService.getInstance()
      .on<SecurityLastInfo[]>(WSEvent.LAST_SECURITIES)
      .subscribe((securities) => {
        dispatch(setSecurities(securities));
      });

    // Specify how to clean up after this effect:
    return function cleanup() {
      window.removeEventListener("resize", updateSize);
      lastSecuritiesSubscription.unsubscribe();
    };
  }, []);

  const updateSize = () => {
    setHeight(window.innerHeight - 20);
  };

  return (
    <div className="p-grid sample-layout analysis">
      {securities
        .filter(({ classCode }) => classCode === ClassCode.SPBFUT)
        .slice(0, 12)
        .map((security) => {
          return (
            <div key={security.id} className="p-col-2" style={{ padding: 0 }}>
              <TrendViewChartWrapper
                security={security}
                eachChartHeight={height / 2}
              />
            </div>
          );
        })}
    </div>
  );
};

export default TrendChartsPage;
