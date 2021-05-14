import moment = require("moment");
import * as React from "react";
import { useState } from "react";
import { BrokerId } from "../../../common/data/BrokerId";
import { SecurityLastInfo } from "../../../common/data/security/SecurityLastInfo";
import { SecurityType } from "../../../common/data/security/SecurityType";
import { SecurityTypeWrapper } from "../../../common/data/security/SecurityTypeWrapper";
import { TradingPlatform } from "../../../common/data/trading/TradingPlatform";
import { DATE_TIME_FORMAT } from "../../../common/utils/utils";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { selectSecurities, setSecurityById } from "../securitiesSlice";
import { SecuritiesFilter } from "./filter/SecuritiesFilter";
import "./Securities.css";
import SecuritiesTable from "./table/SecuritiesTable";

type Props = {};

const Securities: React.FC<Props> = ({}) => {
  const dispatch = useAppDispatch();
  const { securities, security } = useAppSelector(selectSecurities);

  const [platform, setPlatform] = useState<TradingPlatform>(
    TradingPlatform.QUIK
  );
  const [brokerId, setBrokerId] = useState<BrokerId>(BrokerId.ALFA_DIRECT);
  const [secType, setSecType] = useState<SecurityTypeWrapper>(
    SecurityTypeWrapper.FUTURE
  );

  const selectBrokerId = (brokerId: BrokerId) => {
    setBrokerId(brokerId);
    setPlatform(
      brokerId === BrokerId.ALFA_DIRECT
        ? TradingPlatform.QUIK
        : TradingPlatform.API
    );
  };

  const filterSecurities = (
    securities: SecurityLastInfo[],
    secType: SecurityTypeWrapper
  ): SecurityLastInfo[] => {
    return securities.filter((value) => {
      switch (secType) {
        case SecurityTypeWrapper.FUTURE:
          return value.type === SecurityType.FUTURE;
        case SecurityTypeWrapper.STOCK:
          return value.type === SecurityType.STOCK;
        case SecurityTypeWrapper.STOCK_1:
          return value.type === SecurityType.STOCK && value.shareSection === 1;
        case SecurityTypeWrapper.STOCK_2:
          return value.type === SecurityType.STOCK && value.shareSection === 2;
        case SecurityTypeWrapper.STOCK_3:
          return value.type === SecurityType.STOCK && value.shareSection === 3;
        case SecurityTypeWrapper.CURRENCY:
          return value.type === SecurityType.CURRENCY;
      }
    });
  };

  const securitiesFiltered = filterSecurities(securities, secType);
  const lastTimeUpdate = moment(new Date()).format(DATE_TIME_FORMAT);

  return (
    <>
      <SecuritiesFilter
        lastTimeUpdate={lastTimeUpdate}
        brokerId={brokerId}
        onBrokerId={selectBrokerId}
        platform={platform}
        secType={secType}
        changeSecType={setSecType}
      />
      <SecuritiesTable securities={securitiesFiltered} />
    </>
  );
};

export default Securities;
