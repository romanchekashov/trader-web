import * as React from "react";
import { round100 } from "../../utils/utils";
import "./DemandSupply.css";

type Props = {
  totalDemand: number;
  totalSupply: number;
  totalDemandColor?: string;
  totalSupplyColor?: string;
};

export const DemandSupply: React.FC<Props> = ({
  totalDemand,
  totalSupply,
  totalDemandColor = "#16a085",
  totalSupplyColor = "#e74c3c",
}) => {
  if (!totalDemand || !totalSupply) return null;

  const sum = totalDemand + totalSupply;
  const demandWidth = (totalDemand * 100) / sum;
  const supplyWidth = 100 - demandWidth;
  const ratio = round100(totalDemand / totalSupply);

  return (
    <div
      className="demand-supply"
      title={`Общ спрос: ${totalDemand} / Общ предл: ${totalSupply} = ${ratio}`}
    >
      <div
        className="demand"
        style={{ width: demandWidth + "%", backgroundColor: totalDemandColor }}
      >
        <span>{Math.round(demandWidth) + "%"}</span>
      </div>
      <div
        className="supply"
        style={{ width: supplyWidth + "%", backgroundColor: totalSupplyColor }}
      >
        <span>{Math.round(supplyWidth) + "%"}</span>
      </div>
    </div>
  );
};
