import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ToggleButton } from "primereact/togglebutton";
import * as React from "react";
import { Interval } from "../../../data/Interval";
import { SecurityLastInfo } from "../../../data/security/SecurityLastInfo";
import {
  IntervalColor,
  Intervals,
  PrimeDropdownItem,
} from "../../../utils/utils";
import "./ChartWrapperHead.css";
import { PremiseBeforeDate } from "../toolbar/PremiseBeforeDate";
import moment = require("moment");

const _ = require("lodash");

type Props = {
  security: SecurityLastInfo;
  innerInterval: Interval;
  onIntervalUpdated: (e: any) => void;
  numberOfCandles: number;
  onNumberOfCandlesUpdatedWrapper: (e: any) => void;
  startCalendarVisible: boolean;
  showStartCalendar: () => void;
  innerStart: Date;
  onStartUpdated: (innerStart: Date) => void;
  onPremiseBeforeChanged?: (before: Date) => void;
  enableNewOrder: boolean;
  onEnableNewOrderWrapper: (e: any) => void;
  enableTrendLine: boolean;
  onEnableTrendLineWrapper: (e: any) => void;
  needSave: boolean;
  onSave: () => void;
  onCancel: () => void;
  showSRLevels: boolean;
  updateShowSRLevels: (e: any) => void;
  showSRZones: boolean;
  updateShowSRZones: (e: any) => void;
};

const ChartWrapperHead: React.FC<Props> = ({
  security,
  innerInterval,
  onIntervalUpdated,
  numberOfCandles,
  onNumberOfCandlesUpdatedWrapper,
  startCalendarVisible,
  showStartCalendar,
  innerStart,
  onStartUpdated,
  onPremiseBeforeChanged,
  enableNewOrder,
  onEnableNewOrderWrapper,
  enableTrendLine,
  onEnableTrendLineWrapper,
  needSave,
  onSave,
  onCancel,
  showSRLevels,
  updateShowSRLevels,
  showSRZones,
  updateShowSRZones,
}) => {
  const intervals: PrimeDropdownItem<Interval>[] = Intervals.map((val) => ({
    label: val,
    value: val,
  }));

  return (
    <div className="chart-wrapper-head">
      <div className="chart-wrapper-head-security">{security.secCode}</div>
      <div className="chart-wrapper-head-interval">
        <Dropdown
          value={innerInterval}
          options={intervals}
          onChange={onIntervalUpdated}
        />
      </div>
      <div className="chart-wrapper-head-start-date">
        <InputText
          type="number"
          min={100}
          value={numberOfCandles}
          onChange={onNumberOfCandlesUpdatedWrapper}
        />
      </div>
      <div className="chart-wrapper-head-start-date">
        <Button
          icon="pi pi-calendar"
          className={startCalendarVisible ? "" : "p-button-secondary"}
          onClick={showStartCalendar}
        />
        {startCalendarVisible ? (
          <Calendar
            value={innerStart}
            onChange={(e) => onStartUpdated(e.value as Date)}
          />
        ) : null}
      </div>
      <PremiseBeforeDate onBeforeChanged={onPremiseBeforeChanged} />
      <div className="chart-wrapper-head-trendline">
        <ToggleButton
          onLabel="New Order"
          offLabel="New Order"
          checked={enableNewOrder}
          onChange={onEnableNewOrderWrapper}
        />
      </div>
      <div className="chart-wrapper-head-trendline">
        <ToggleButton
          onLabel="Drawing"
          offLabel="Draw Line"
          checked={enableTrendLine}
          onChange={onEnableTrendLineWrapper}
        />
      </div>

      {needSave ? (
        <div className="chart-wrapper-head-trendline">
          <Button label="Save" onClick={onSave} />
        </div>
      ) : null}

      {needSave ? (
        <div className="chart-wrapper-head-trendline">
          <Button
            label="Cancel"
            className="p-button-secondary"
            onClick={onCancel}
          />
        </div>
      ) : null}

      <div className="chart-wrapper-head-trendline">
        <ToggleButton
          onLabel="SRLevels"
          offLabel="SRLevels"
          checked={showSRLevels}
          onChange={updateShowSRLevels}
        />
      </div>
      <div className="chart-wrapper-head-legends">
        <div
          className="chart-wrapper-head-legend"
          style={{ backgroundColor: IntervalColor.MONTH }}
        >
          MN
        </div>
        <div
          className="chart-wrapper-head-legend"
          style={{ backgroundColor: IntervalColor.WEEK }}
        >
          W
        </div>
        <div
          className="chart-wrapper-head-legend"
          style={{ backgroundColor: IntervalColor.DAY }}
        >
          D
        </div>
        <div
          className="chart-wrapper-head-legend"
          style={{ backgroundColor: IntervalColor.H4 }}
        >
          H4
        </div>
        <div
          className="chart-wrapper-head-legend"
          style={{ backgroundColor: IntervalColor.H2 }}
        >
          H2
        </div>
        <div
          className="chart-wrapper-head-legend"
          style={{ backgroundColor: IntervalColor.M60 }}
        >
          M60
        </div>
        <div
          className="chart-wrapper-head-legend"
          style={{ backgroundColor: IntervalColor.M30 }}
        >
          M30
        </div>
      </div>

      <div className="chart-wrapper-head-trendline">
        <ToggleButton
          onLabel="SRZones"
          offLabel="SRZones"
          checked={showSRZones}
          onChange={updateShowSRZones}
        />
      </div>
    </div>
  );
};

export default ChartWrapperHead;
