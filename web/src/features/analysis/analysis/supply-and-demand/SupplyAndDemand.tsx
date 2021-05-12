import * as React from "react";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../../../app/hooks";
import { selectSecurities } from "../../../../app/securities/securitiesSlice";
import { SupplyAndDemandChart } from "./SupplyAndDemandChart";
import { SupplyAndDemandData } from "./SupplyAndDemandData";

type Props = {};

export const SupplyAndDemand: React.FC<Props> = ({}) => {
  const { security } = useAppSelector(selectSecurities);

  const [secCode, setSecCode] = useState<string>();
  const [items, setItems] = useState<SupplyAndDemandData[]>([]);

  useEffect(() => {
    if (security) {
      if (secCode !== security.secCode) {
        setSecCode(security.secCode);
        setItems([]);
      }
      setItems([
        ...items,
        {
          totalSupply: security.totalSupply,
          totalDemand: security.totalDemand,
          dateTime: new Date(),
        },
      ]);
    }
  }, [security]);

  return (
    <div className="p-grid analysis-head">
      <div className="p-col-12">
        <SupplyAndDemandChart
          items={items}
          title={"Total Supply And Demand of " + secCode}
          windowSize={180}
          dateTimeFormat={"HH:mm:ss"}
          width={280}
          height={200}
        />
      </div>
    </div>
  );
};
