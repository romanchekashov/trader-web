import * as React from "react";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../../../app/hooks";
import { selectSecurities } from "../../../../app/securities/securitiesSlice";
import {
  getMoexApiOpenInterestList,
  getMoexOpenInterests,
} from "../../../../common/api/rest/analysisRestApi";
import { MoexOpenInterest } from "../../../../common/data/open-interest/MoexOpenInterest";
import {
  fizLongColor,
  fizShortColor,
  MoexOpenInterestChart,
  yurLongColor,
  yurShortColor,
} from "./MoexOpenInterestChart";
import { MoexOpenInterestTable } from "./MoexOpenInterestTable";
import moment = require("moment");
import { useRef } from "react";
import { SecurityLastInfo } from "../../../../common/data/security/SecurityLastInfo";
import { DemandSupply } from "../../../../common/components/demand-supply/DemandSupply";
import "./MoexOpenInterestView.css";
import { ClassCode } from "../../../../common/data/ClassCode";

type Props = {
  security: SecurityLastInfo;
};

export const MoexOpenInterestView: React.FC<Props> = ({ security }) => {
  if (security?.classCode !== ClassCode.SPBFUT) return null;

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
      <div className="p-col-12">
        <MoexOpenInterestTable moexOpenInterest={openInterestLastDay} />
      </div>
      <div className="p-col-12">
        <MoexOpenInterestChart
          moexOpenInterests={moexOpenInterestsForDays}
          title={"OI history"}
          dateTimeFormat={"DD MMM YY"}
          width={ref?.current?.clientWidth || 800}
          height={ref?.current?.clientWidth < 500 ? 400 : 600}
        />
      </div>
      <div className="p-col-12">
        <MoexOpenInterestChart
          moexOpenInterests={moexOpenInterests}
          title={"Real-time OI for last date"}
          dateTimeFormat={"HH:mm/DD MMM YY"}
          width={ref?.current?.clientWidth || 500}
          height={400}
        />
      </div>
    </div>
  );
};
