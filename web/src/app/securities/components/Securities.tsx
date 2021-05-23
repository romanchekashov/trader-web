import moment = require("moment");
import * as React from "react";
import { useState } from "react";
import { BrokerId } from "../../../common/data/BrokerId";
import { SecurityLastInfo } from "../../../common/data/security/SecurityLastInfo";
import { SecurityType } from "../../../common/data/security/SecurityType";
import { SecurityTypeWrapper } from "../../../common/data/security/SecurityTypeWrapper";
import { TradingPlatform } from "../../../common/data/trading/TradingPlatform";
import { filterSecurities } from "../../../common/utils/DataUtils";
import { DATE_TIME_FORMAT } from "../../../common/utils/utils";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { selectSecurities, setSecurityById } from "../securitiesSlice";
import { SecuritiesFilter } from "./filter/SecuritiesFilter";
import "./Securities.css";
import SecuritiesTable from "./table/SecuritiesTable";

type Props = {};

const Securities: React.FC<Props> = ({}) => {
  const dispatch = useAppDispatch();
  const { securities, security, selectedSecurityTypeWrapper } =
    useAppSelector(selectSecurities);

  const [platform, setPlatform] = useState<TradingPlatform>(
    TradingPlatform.QUIK
  );
  const [brokerId, setBrokerId] = useState<BrokerId>(BrokerId.ALFA_DIRECT);

  const selectBrokerId = (brokerId: BrokerId) => {
    setBrokerId(brokerId);
    setPlatform(
      brokerId === BrokerId.ALFA_DIRECT
        ? TradingPlatform.QUIK
        : TradingPlatform.API
    );
  };

  const securitiesFiltered = filterSecurities(
    securities,
    selectedSecurityTypeWrapper
  );
  const lastTimeUpdate = moment(new Date()).format(DATE_TIME_FORMAT);

  return (
    <>
      <SecuritiesFilter
        lastTimeUpdate={lastTimeUpdate}
        brokerId={brokerId}
        onBrokerId={selectBrokerId}
        platform={platform}
      />
      <SecuritiesTable securities={securitiesFiltered} />
    </>
  );
};

export default Securities;
