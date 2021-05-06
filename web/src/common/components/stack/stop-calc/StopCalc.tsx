import * as React from "react";
import { useState } from "react";
import "./StopCalc.css";
import { SecurityLastInfo } from "../../../data/security/SecurityLastInfo";
import { SecurityFuture } from "../../../data/security/SecurityFuture";
import { roundByMultiplier } from "../../../utils/utils";
import { getSecurity } from "../../../utils/Cache";
import { ClassCode } from "../../../data/ClassCode";
import { InputText } from "primereact/inputtext";

type Props = {
  securityLastInfo: SecurityLastInfo;
  showSmall?: boolean;
};

export const StopCalc: React.FC<Props> = ({ securityLastInfo, showSmall }) => {
  const [stop, setStop] = useState(500);

  const calcStopPrice = (quantity: number, isShort: boolean): number => {
    if (!securityLastInfo || ClassCode.SPBFUT !== securityLastInfo.classCode)
      return null;
    const stepPrice = securityLastInfo.futureStepPrice;
    const secPriceStep = securityLastInfo.secPriceStep;
    const minStepPrice = stepPrice / secPriceStep;
    const priceForQuantity = stop / quantity;
    const priceDiff = priceForQuantity / minStepPrice;

    let stopPrice = securityLastInfo.lastTradePrice - priceDiff;
    if (isShort) {
      stopPrice = securityLastInfo.lastTradePrice + priceDiff;
    }

    const multiplier = Math.pow(10, securityLastInfo.scale);
    return roundByMultiplier(stopPrice, multiplier);
  };

  const calcStopPriceView = (quantity: number, isShort: boolean) => {
    return (
      <div className="td__stop-calc-item">
        <div>{quantity}</div>
        <div>{calcStopPrice(quantity, isShort)}</div>
      </div>
    );
  };

  const calcMarginPerContract = (from: number, to: number) => {
    const security = getSecurity(
      securityLastInfo.classCode,
      securityLastInfo.secCode
    );
    const securityFuture = security as SecurityFuture;
    const minStepPrice = securityFuture.stepPrice / securityFuture.secPriceStep;
    const current = from * minStepPrice;
    const enter = to * minStepPrice;
    return Math.abs(current - enter);
  };

  const stopChangeByKeydown = (e) => {
    if (e.key === "ArrowUp") {
      setStop(stop + 0.01);
    } else if (e.key === "ArrowDown" && stop > 0.01) {
      setStop(stop - 0.01);
    }
  };

  return (
    <div className="td__stop-calc">
      <div>
        <label htmlFor="td__stop-calc-stop">Stop:</label>
        <InputText
          id="td__stop-calc-stop"
          type="number"
          value={stop}
          onKeyDown={stopChangeByKeydown}
          onChange={(e) => setStop(parseFloat(e.target["value"]))}
        />
      </div>
      {calcStopPriceView(1, true)}
      {!showSmall ? calcStopPriceView(2, true) : null}
      {calcStopPriceView(5, true)}
      {!showSmall ? calcStopPriceView(10, true) : null}
      {calcStopPriceView(15, true)}
      {!showSmall ? calcStopPriceView(20, true) : null}
      <div className="td__stop-calc-price">
        {securityLastInfo ? securityLastInfo.lastTradePrice : 0}
      </div>
      {!showSmall ? calcStopPriceView(20, false) : null}
      {calcStopPriceView(15, false)}
      {!showSmall ? calcStopPriceView(10, false) : null}
      {calcStopPriceView(5, false)}
      {!showSmall ? calcStopPriceView(2, false) : null}
      {calcStopPriceView(1, false)}
    </div>
  );
};
