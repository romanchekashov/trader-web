import { Dropdown } from "primereact/dropdown";
import { Paginator } from "primereact/paginator";
import * as React from "react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  loadLastSecurities,
  selectSecurities,
  setSecurities,
} from "../../app/securities/securitiesSlice";
import { WebsocketService, WSEvent } from "../../common/api/WebsocketService";
import TrendViewChartWrapper from "../../common/components/trend/TrendViewChartWrapper/TrendViewChartWrapper";
import { Interval } from "../../common/data/Interval";
import { SecurityLastInfo } from "../../common/data/security/SecurityLastInfo";
import { SecurityTypeWrapper } from "../../common/data/security/SecurityTypeWrapper";
import { filterSecurities } from "../../common/utils/DataUtils";
import { PrimeDropdownItem } from "../../common/utils/utils";
import { loadFilterData } from "../analysis/AnalysisSlice";
import "./TrendChartsPage.css";

const DEFAULT_CHARTS_NUMBER = 12;
const intervals: PrimeDropdownItem<Interval>[] = [
  Interval.M1,
  Interval.M3,
  Interval.M5,
  Interval.M15,
  Interval.M30,
  Interval.M60,
  Interval.H2,
  Interval.DAY,
  Interval.WEEK,
  Interval.MONTH,
].map((val) => ({ label: val, value: val }));

type Props = {};

const TrendChartsPage: React.FC<Props> = ({}) => {
  const dispatch = useAppDispatch();
  const { securities, security, selectedSecurityTypeWrapper } =
    useAppSelector(selectSecurities);

  const [page, setPage] = useState<number>(0);
  const [height, setHeight] = useState<number>(800);
  const [interval, setInterval] = useState<Interval>(Interval.M1);

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

  useEffect(() => {
    setPage(0);
    setInterval(
      selectedSecurityTypeWrapper === SecurityTypeWrapper.FUTURE
        ? Interval.M5
        : Interval.M60
    );
  }, [selectedSecurityTypeWrapper]);

  const updateSize = () => {
    setHeight(window.innerHeight - 20 - 37);
  };

  const secs = filterSecurities(securities, selectedSecurityTypeWrapper);

  const rightContent = (
    <Dropdown
      value={interval}
      options={intervals}
      onChange={(e) => {
        setInterval(e.value);
      }}
    />
  );

  return (
    <div className="p-grid sample-layout analysis TrendChartsPage">
      <div className="p-col-12" style={{ padding: 0 }}>
        <Paginator
          first={page}
          rows={DEFAULT_CHARTS_NUMBER}
          totalRecords={secs.length}
          onPageChange={(e) => setPage(e.first)}
          style={{ padding: 0 }}
          rightContent={rightContent}
        ></Paginator>
      </div>
      {secs.slice(page, page + DEFAULT_CHARTS_NUMBER).map((sec) => {
        return (
          <div
            key={sec.id}
            className={`p-col-2 ${sec.id === security?.id ? "active" : ""}`}
            style={{ padding: 0 }}
          >
            <TrendViewChartWrapper
              security={sec}
              eachChartHeight={height / 2}
              timeFrame={interval}
            />
          </div>
        );
      })}
    </div>
  );
};

export default TrendChartsPage;
