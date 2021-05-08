import { TabPanel, TabView } from "primereact/tabview";
import * as React from "react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  selectSecurities,
  setSecurity,
} from "../../app/securities/securitiesSlice";
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
  const { filter } = useAppSelector(selectFilter);
  const { security } = useAppSelector(selectSecurities);
  const { shares, currencies, futures } = useAppSelector(selectAnalysis);

  const [isDetailsShown, setIsDetailsShown] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isTabShown, setIsTabShown] = useState(false);

  useEffect(() => {
    dispatch(loadFilterData(false));
  }, []);

  const onSelectRow = (selectedSecurity: SecurityLastInfo) => {
    if (selectedSecurity) {
      StackService.getInstance().send(
        StackEvent.SECURITY_SELECTED,
        selectedSecurity
      );
      setIsDetailsShown(true);
    } else {
      setIsDetailsShown(false);
    }
    dispatch(setSecurity(selectedSecurity));
    setSelectedSecurity(selectedSecurity);
  };

  const onTabChange = (e: any) => {
    setActiveTabIndex(e.index);
    setIsTabShown(!isTabShown);
  };

  const classDataTable = isDetailsShown ? "p-col-12" : "p-col-12";
  const classDetails = isDetailsShown ? "p-col-12" : "hidden";

  return (
    <div className="p-grid sample-layout analysis">
      {/*<div className="p-col-12" style={{padding: 0}}>
                    <Filter filter={filterData} onStart={this.onStart}/>
                </div>*/}
      <div className={classDataTable}>
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
      <div className={classDetails}>
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
