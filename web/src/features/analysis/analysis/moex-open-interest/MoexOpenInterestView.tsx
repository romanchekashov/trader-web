import * as React from "react";
import { memo, useEffect, useRef, useState } from "react";
import {
  getMoexApiOpenInterestList,
  getMoexOpenInterests
} from "../../../../common/api/rest/analysisRestApi";
import { DemandSupply } from "../../../../common/components/demand-supply/DemandSupply";
import { ClassCode } from "../../../../common/data/ClassCode";
import { MoexOpenInterest } from "../../../../common/data/open-interest/MoexOpenInterest";
import { SecurityLastInfo } from "../../../../common/data/security/SecurityLastInfo";
import {
  fizLongColor,
  fizShortColor,
  MoexOpenInterestChart,
  yurLongColor,
  yurShortColor
} from "./MoexOpenInterestChart";
import { MoexOpenInterestTable } from "./MoexOpenInterestTable";
import "./MoexOpenInterestView.css";
import moment = require("moment");

type Props = {
  security: SecurityLastInfo;
  showTable?: boolean;
  showRealTimeOI?: boolean;
};

const MoexOpenInterestView: React.FC<Props> = ({
  security,
  showTable = true,
  showRealTimeOI = true,
}) => {

  const ref = useRef(null);

  const [moexOpenInterestsForDays, setMoexOpenInterestsForDays] = useState<
    MoexOpenInterest[]
  >([]);
  const [moexOpenInterests, setMoexOpenInterests] = useState<
    MoexOpenInterest[]
  >([]);

  useEffect(() => {
    if (security) {
      const days = ref?.current?.clientWidth < 500 ? 20 : 100;
      const from = moment().subtract(days, "days").format("YYYY-MM-DD");

      getMoexOpenInterests(security.classCode, security.secCode, from).then(
        setMoexOpenInterestsForDays
      );

      getMoexApiOpenInterestList(security.classCode, security.secCode).then(
        setMoexOpenInterests
      );
    }

    const intervalToFetchOpenInterest = setInterval(() => {
      if (security) {
        getMoexApiOpenInterestList(security.classCode, security.secCode).then(
          setMoexOpenInterests
        );
      }
    }, 60000);

    // Specify how to clean up after this effect:
    return function cleanup() {
      clearInterval(intervalToFetchOpenInterest);
    };
  }, [security?.id]);

  if (security?.classCode !== ClassCode.SPBFUT) return null;

  const openInterestLastDay =
    moexOpenInterestsForDays.length > 0
      ? moexOpenInterestsForDays[moexOpenInterestsForDays.length - 1]
      : null;

  return (
    <div ref={ref} className="p-grid analysis-head">
      <h3 className="MoexOpenInterestView_title">Open Interest Prev Day</h3>
      {openInterestLastDay ? (
        <div className="p-col-12">
          <DemandSupply
            totalDemand={openInterestLastDay.fizPosLong}
            totalDemandColor={fizLongColor}
            totalSupply={openInterestLastDay.fizPosShort}
            totalSupplyColor={fizShortColor}
          />
          <DemandSupply
            totalDemand={openInterestLastDay.yurPosLong}
            totalDemandColor={yurLongColor}
            totalSupply={openInterestLastDay.yurPosShort}
            totalSupplyColor={yurShortColor}
          />
        </div>
      ) : null}
      {showTable ? (
        <div className="p-col-12">
          <MoexOpenInterestTable moexOpenInterest={openInterestLastDay} />
        </div>
      ) : null}
      <div className="p-col-12">
        <MoexOpenInterestChart
          moexOpenInterests={moexOpenInterestsForDays}
          title={"OI history"}
          dateTimeFormat={"DD MMM YY"}
          width={ref?.current?.clientWidth || 800}
          height={ref?.current?.clientWidth < 500 ? 300 : 600}
        />
      </div>
      {showRealTimeOI ? (
        <div className="p-col-12">
          <MoexOpenInterestChart
            moexOpenInterests={moexOpenInterests}
            title={"Real-time OI for last date"}
            dateTimeFormat={"HH:mm/DD MMM YY"}
            width={ref?.current?.clientWidth || 500}
            height={400}
          />
        </div>
      ) : null}
    </div>
  );
};

const areEqual = (prevProps, nextProps) => {
  return prevProps.security?.id === nextProps.security?.id;
};

export default memo(MoexOpenInterestView, areEqual);
