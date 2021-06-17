import { Dropdown } from "primereact/dropdown";
import * as React from "react";
import { BrokerId } from "../../../../../common/data/BrokerId";
import { SecurityTypeWrapper } from "../../../../../common/data/security/SecurityTypeWrapper";
import { TradingPlatform } from "../../../../../common/data/trading/TradingPlatform";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import {
  selectBrokerId,
  selectSecurities,
  selectSecurityTypeWrapper
} from "../../../securitiesSlice";
import "./SecuritiesFilter.css";

type Props = {
  lastTimeUpdate: string;
};

export const SecuritiesFilter: React.FC<Props> = ({ lastTimeUpdate }) => {
  const dispatch = useAppDispatch();
  const {
    selectedSecurityTypeWrapper,
    selectedBrokerId,
    selectedTradingPlatform,
  } = useAppSelector(selectSecurities);

  const types = [
    { label: "ALL", value: null },
    { label: "F", value: SecurityTypeWrapper.FUTURE },
    { label: "S", value: SecurityTypeWrapper.STOCK },
    { label: "S1", value: SecurityTypeWrapper.STOCK_1 },
    { label: "S2", value: SecurityTypeWrapper.STOCK_2 },
    { label: "S3", value: SecurityTypeWrapper.STOCK_3 },
    { label: "C", value: SecurityTypeWrapper.CURRENCY },
  ];
  const ALL = "ALL";
  const brokerIds = [BrokerId.ALFA_DIRECT, BrokerId.TINKOFF_INVEST].map(
    (val) => ({ label: val, value: val })
  );
  const platforms = (
    selectedBrokerId === BrokerId.ALFA_DIRECT
      ? [TradingPlatform.QUIK]
      : [TradingPlatform.API]
  ).map((val) => ({ label: val, value: val }));

  return (
    <div className="securities-filter-">
      <div className="notifications-head-dropdown">
        <Dropdown
          value={selectedBrokerId}
          options={brokerIds}
          onChange={(e) => dispatch(selectBrokerId(e.value))}
          placeholder="Select a broker"
        />

        <Dropdown
          value={selectedTradingPlatform}
          options={platforms}
          onChange={(e) => {
            // onPlatformChange(e.value)
          }}
          placeholder="Select a platform"
        />
        <Dropdown
          value={selectedSecurityTypeWrapper}
          options={types}
          onChange={e => dispatch(selectSecurityTypeWrapper(e.value))}
        />
        {lastTimeUpdate}
      </div>
    </div>
  );
};
