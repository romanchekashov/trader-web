import * as React from "react";
import { useAppSelector } from "../../../../app/hooks";
import { selectSecurities } from "../../../../app/securities/securitiesSlice";
import { DemandSupply } from "../../../../common/components/demand-supply/DemandSupply";
import { ClassCode } from "../../../../common/data/ClassCode";
import { formatNumber } from "../../../../common/utils/utils";
import "./SecurityLastInfoView.css";

type Props = {};

export const SecurityLastInfoView: React.FC<Props> = ({}) => {
  const { security } = useAppSelector(selectSecurities);

  if (!security) return null;

  const {
    id,
    code,
    name,
    secCode,
    classCode,
    lastChange,
    lastTradePrice,
    secPriceStep,
    numTradesToday,
    valueToday,
    totalDemand,
    totalSupply,
    futureSellDepoPerContract,
    futureBuyDepoPerContract,
  } = security;

  return (
    <div className="p-grid security-last-info-view">
      <div className="p-col-12">
        <div>
          {code}({id}) {name}(<strong>{secCode}</strong>)
          <span> Шаг цены: {secPriceStep}</span>
        </div>
        <div>
          Цена: <strong>{lastTradePrice}</strong>
          <span>
            % изм: <strong>{lastChange}% </strong>
          </span>
        </div>
        <div>
          <span>
            Кол-во сделок: <strong>{numTradesToday} </strong>
          </span>
          <span>
            Оборот: <strong>{formatNumber(valueToday)}</strong>
          </span>
        </div>
        <div>
          Gap: D: <strong>{security.gapDay} </strong>
          D(%): <strong>{security.gapDayPercent}%</strong>
        </div>
        <div>
          GerchikAtrDis(%): AVG(D):{" "}
          <strong>
            {security.distancePassedSinceLastDayCloseRelativeToAtrAvg}{" "}
          </strong>
          (D):{" "}
          <strong>
            {security.distancePassedSinceLastDayCloseRelativeToAtr}
          </strong>
        </div>
        <div>
          ATR(14): D: <strong>{security.atrDay} </strong>
          {security.atrM60 ? (
            <span>
              M60: <strong>{security.atrM60} </strong>
            </span>
          ) : null}
          M30: <strong>{security.atrM30} </strong>
          {security.atrM3 ? (
            <span>
              M3: <strong>{security.atrM3} </strong>
            </span>
          ) : null}
        </div>
        <div>
          Vol(Last/Prev): D: <strong>{security.volumeInPercentDay} </strong>
          {security.volumeInPercentM60 ? (
            <span>
              M60: <strong>{security.volumeInPercentM60} </strong>
            </span>
          ) : null}
          M30: <strong>{security.volumeInPercentM30} </strong>
          {security.volumeInPercentM3 ? (
            <span>
              M3: <strong>{security.volumeInPercentM3} </strong>
            </span>
          ) : null}
        </div>
        <div>
          Vol Today: <strong>{security.volumeToday} </strong>
          Rel Vol(D): <strong>{security.relativeVolumeDay}</strong>
        </div>
        {security.percentOfFreeFloatTradedToday ? (
          <div>
            Float Traded(%):{" "}
            <strong>{security.percentOfFreeFloatTradedToday}</strong>
          </div>
        ) : null}
        {classCode === ClassCode.SPBFUT ? (
          <div>
            ГО прод: {futureSellDepoPerContract} / ГО покуп:{" "}
            {futureBuyDepoPerContract}
          </div>
        ) : null}
        <div>
          Общ спрос: {totalDemand} / Общ предл: {totalSupply}
        </div>

        <DemandSupply totalDemand={totalDemand} totalSupply={totalSupply} />
      </div>
    </div>
  );
};
