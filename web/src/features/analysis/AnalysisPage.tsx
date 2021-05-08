import { TabPanel, TabView } from "primereact/tabview";
import * as React from "react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  loadLastSecurities,
  selectSecurities,
  setSecurities,
  setSecurityById,
} from "../../app/securities/securitiesSlice";
import { WebsocketService, WSEvent } from "../../common/api/WebsocketService";
import {
  StackEvent,
  StackService,
} from "../../common/components/stack/StackService";
import { ClassCode } from "../../common/data/ClassCode";
import { Market } from "../../common/data/Market";
import { SecurityLastInfo } from "../../common/data/security/SecurityLastInfo";
import { setSelectedSecurity } from "../../common/utils/Cache";
import "./Analysis.css";
import Analysis from "./analysis/Analysis";
import AnalysisFutures from "./analysis/AnalysisFutures";
import { AnalysisTinkoff } from "./analysis/AnalysisTinkoff";
import { loadFilterData, selectAnalysis, selectFilter } from "./AnalysisSlice";
import { Securities } from "./securities/Securities";

type Props = {};

const AnalysisPage: React.FC<Props> = ({}) => {
  const dispatch = useAppDispatch();
  const { security } = useAppSelector(selectSecurities);
  const { filter } = useAppSelector(selectFilter);
  const { shares, currencies, futures } = useAppSelector(selectAnalysis);

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isTabShown, setIsTabShown] = useState(false);

  useEffect(() => {
    dispatch(loadFilterData(false));
    dispatch(loadLastSecurities());
    const lastSecuritiesSubscription = WebsocketService.getInstance()
      .on<SecurityLastInfo[]>(WSEvent.LAST_SECURITIES)
      .subscribe((securities) => {
        dispatch(setSecurities(securities));
      });

    // Specify how to clean up after this effect:
    return function cleanup() {
      lastSecuritiesSubscription.unsubscribe();
    };
  }, []);

  const onSelectRow = (selectedSecurity: SecurityLastInfo) => {
    if (selectedSecurity) {
      StackService.getInstance().send(
        StackEvent.SECURITY_SELECTED,
        selectedSecurity
      );
    }
    dispatch(setSecurityById(selectedSecurity?.id));
    setSelectedSecurity(selectedSecurity);
  };

  const onTabChange = (e: any) => {
    setActiveTabIndex(e.index);
    setIsTabShown(!isTabShown);
  };

  return (
    <div className="p-grid sample-layout analysis">
      {/*<div className="p-col-12" style={{padding: 0}}>
                    <Filter filter={filterData} onStart={this.onStart}/>
                </div>*/}
      <div className="p-col-12">
        <div className="p-grid analysis-securities">
          <TabView
            activeIndex={activeTabIndex}
            onTabChange={onTabChange}
            className={isTabShown ? "" : "analysis_tab_toggle"}
          >
            <TabPanel header="Screener">
              {isTabShown ? <Securities onSelectRow={onSelectRow} /> : null}
            </TabPanel>
          </TabView>
        </div>
      </div>
      <div className="p-col-12">
        {!security ? (
          <div>Select security</div>
        ) : Market.SPB === security.market ? (
          <AnalysisTinkoff security={security} />
        ) : ClassCode.SPBFUT === security.classCode ? (
          <AnalysisFutures security={security} />
        ) : (
          <Analysis security={security} />
        )}
      </div>
    </div>
  );
};

export default AnalysisPage;
