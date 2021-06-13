import moment = require("moment");
import { Dropdown } from "primereact/dropdown";
import { TabPanel, TabView } from "primereact/tabview";
import * as React from "react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { loadEconomicCalendarEvents } from "../../app/news/newsSlice";
import PossibleTradesStat from "../../app/possibleTrades/components/PossibleTradesStat";
import {
  selectSecurities,

  setSecurityById
} from "../../app/securities/securitiesSlice";
import ActiveTradesView from "../../common/components/control-panel/components/ActiveTradesView";
import {
  StackEvent,
  StackService
} from "../../common/components/stack/StackService";
import { ClassCode } from "../../common/data/ClassCode";
import { SecurityLastInfo } from "../../common/data/security/SecurityLastInfo";
import { setSelectedSecurity } from "../../common/utils/Cache";
import { DATE_FORMAT, PrimeDropdownItem } from "../../common/utils/utils";
import "./Analysis.css";
import Analysis from "./analysis/Analysis";
import AnalysisFutures from "./analysis/AnalysisFutures";
import { selectFilter } from "./AnalysisSlice";
import { SecuritiesScreener } from "./SecuritiesScreener/SecuritiesScreener";

type Props = {};

const AnalysisPage: React.FC<Props> = ({}) => {
  const dispatch = useAppDispatch();
  const { security } = useAppSelector(selectSecurities);
  const { filter } = useAppSelector(selectFilter);

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isTabShown, setIsTabShown] = useState(false);
  const [chartNumber, setChartNumber] = useState<number>(2);
  const chartNumbers: PrimeDropdownItem<number>[] = [1, 2].map((val) => ({
    label: "" + val,
    value: val,
  }));

  useEffect(() => {
    const weeks = security?.id ? 12 : 1;
    dispatch(loadEconomicCalendarEvents({ 
      start: moment().subtract(weeks, "weeks").format(DATE_FORMAT),
      secId: security?.id 
    }));
  }, [security?.id]);

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

  const onChartNumberChanged = (num: number) => {
    setChartNumber(num);
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
              {isTabShown ? <SecuritiesScreener onSelectRow={onSelectRow} /> : null}
            </TabPanel>
            <TabPanel header="Active Trades">
              {isTabShown ? (
                <ActiveTradesView onSelectRow={null} selected={null} />
              ) : null}
            </TabPanel>
            <TabPanel header="Possible Trades Stat">
              {isTabShown ? <PossibleTradesStat /> : null}
            </TabPanel>
          </TabView>
          <div className="p-col-1 analysis-head">
            <div className="analysis-head-chart-number">
              <Dropdown
                value={chartNumber}
                options={chartNumbers}
                onChange={(e) => onChartNumberChanged(e.value)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="p-col-12">
        {!security ? (
          <div>Select security</div>
        ) : ClassCode.SPBFUT === security.classCode ? (
          <AnalysisFutures security={security} chartNumber={chartNumber} />
        ) : (
          <Analysis security={security} chartNumber={chartNumber} />
        )}
      </div>
    </div>
  );
};

export default AnalysisPage;
