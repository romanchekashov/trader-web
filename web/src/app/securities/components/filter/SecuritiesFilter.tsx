import { Dropdown } from "primereact/dropdown";
import * as React from "react";
import { useEffect } from "react";
import { BrokerId } from "../../../../common/data/BrokerId";
import { SecurityTypeWrapper } from "../../../../common/data/security/SecurityTypeWrapper";
import { TradingPlatform } from "../../../../common/data/trading/TradingPlatform";
import "./SecuritiesFilter.css";

type Props = {
  lastTimeUpdate: string;
  brokerId: BrokerId;
  onBrokerId: (brokerId: BrokerId) => void;
  platform: TradingPlatform;
  // onPlatformChange: (platform: TradingPlatform) => void
  secType: SecurityTypeWrapper;
  changeSecType: (secType: SecurityTypeWrapper) => void;
};

export const SecuritiesFilter: React.FC<Props> = ({
  lastTimeUpdate,
  brokerId,
  onBrokerId,
  platform,
  secType,
  changeSecType,
}) => {
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
    brokerId === BrokerId.ALFA_DIRECT
      ? [TradingPlatform.QUIK]
      : [TradingPlatform.API]
  ).map((val) => ({ label: val, value: val }));

  const updateSecType = (e: any): void => changeSecType(e.value);

  useEffect(() => {}, []);

  return (
    <div className="securities-filter-">
      <div>
        <Dropdown
          value={brokerId}
          options={brokerIds}
          onChange={(e) => {
            onBrokerId(e.value);
          }}
          placeholder="Select a broker"
        />

        <Dropdown
          value={platform}
          options={platforms}
          onChange={(e) => {
            // onPlatformChange(e.value)
          }}
          placeholder="Select a platform"
        />
      </div>

      <div>
        <Dropdown value={secType} options={types} onChange={updateSecType} />
        {lastTimeUpdate}
      </div>
    </div>
  );
};