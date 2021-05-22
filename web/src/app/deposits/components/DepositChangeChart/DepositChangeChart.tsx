import { Chart } from "primereact/chart";
import * as React from "react";
import { useEffect, useState } from "react";
import { Deposit } from "../../../../common/data/Deposit";
import { SecurityType } from "../../../../common/data/security/SecurityType";
import { TrendDirection } from "../../../../common/data/strategy/TrendDirection";
import { TrendDirectionColor } from "../../../../common/utils/utils";
import depositsApi from "../../depositsApi";
import "./DepositChangeChart.css";
import moment = require("moment");

const options = {
  title: {
    display: true,
    fontSize: 12,
  },
  animation: {
    duration: 0,
  },
  legend: {
    display: false,
  },
};

type Props = {
  securityType: SecurityType;
  width: number;
  height: number;
};

const DepositChangeChart: React.FC<Props> = ({
  securityType,
  width,
  height,
}) => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);

  useEffect(() => {
    depositsApi.getDeposits(securityType).then(setDeposits);
  }, [securityType]);

  const getColor = (direction: TrendDirection) => {
    return TrendDirectionColor[direction] || "#3f51b5";
  };

  const updateData = (deposits: Deposit[]): any => {
    const color = getColor(TrendDirection.SIDE);
    const dateTimeFormat = "DD-MM-YYYY";
    const datasets = [];

    datasets.push({
      label: `Depo`,
      data: deposits.map((value) => value.amount),
      fill: false,
      backgroundColor: color,
      borderColor: color,
    });

    return {
      labels: deposits.map((value) =>
        moment(value.created).format(dateTimeFormat)
      ),
      datasets,
    };
  };

  if (!deposits.length) return <div>Select security for trend analysis</div>;

  const data = updateData(deposits);

  return (
    <div className="TrendViewChart" style={{ height, width }}>
      <div className="TrendViewChart_title"></div>
      <Chart
        type="line"
        data={data}
        options={options}
        width={width + "px"}
        height={height - 20 + "px"}
      />
    </div>
  );
};

export default DepositChangeChart;
