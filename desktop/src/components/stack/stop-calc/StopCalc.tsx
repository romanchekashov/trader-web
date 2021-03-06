import * as React from "react";
import {useState} from "react";
import "./StopCalc.css";
import {SecurityLastInfo} from "../../../common/data/SecurityLastInfo";
import {Security} from "../../../common/data/Security";
import {SecurityFuture} from "../../../common/data/SecurityFuture";
import {InputText} from "primereact/components/inputtext/InputText";
import {roundByMultiplier} from "../../../common/utils/utils";

type Props = {
    security: Security
    securityLastInfo: SecurityLastInfo
};

export const StopCalc: React.FC<Props> = ({security, securityLastInfo}) => {

    const [stop, setStop] = useState(500);

    const calcStopPrice = (quantity: number, isShort: boolean): number => {
        if (!security || !securityLastInfo) return null;

        const securityFuture = security as SecurityFuture;
        const minStepPrice = securityFuture.stepPrice / securityFuture.secPriceStep;

        const priceForQuantity = stop / quantity;
        const priceDiff = priceForQuantity / minStepPrice;

        let stopPrice = securityLastInfo.priceLastTrade - priceDiff;
        if (isShort) {
            stopPrice = securityLastInfo.priceLastTrade + priceDiff;
        }

        const arr = ("" + security.secPriceStep).split(".");
        if (arr.length > 1) {
            const multiplier = Math.pow(10, arr[1].length);
            return roundByMultiplier(stopPrice, multiplier);
        }

        return stopPrice;
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
        const securityFuture = security as SecurityFuture;
        const minStepPrice = securityFuture.stepPrice / securityFuture.secPriceStep;
        const current = from * minStepPrice;
        const enter = to * minStepPrice;
        return Math.abs(current - enter);
    };

    return (
        <div className="td__stop-calc">
            <div>
                <label htmlFor="td__stop-calc-stop">Stop:</label>
                <InputText id="td__stop-calc-stop"
                           type="number"
                           value={stop}
                           onChange={(e) => setStop(e.target['value'])}/>
            </div>
            {calcStopPriceView(1, true)}
            {calcStopPriceView(2, true)}
            {calcStopPriceView(5, true)}
            {calcStopPriceView(10, true)}
            {calcStopPriceView(15, true)}
            {calcStopPriceView(20, true)}
            <div className="td__stop-calc-price">{securityLastInfo ? securityLastInfo.priceLastTrade : null}</div>
            {calcStopPriceView(20, false)}
            {calcStopPriceView(15, false)}
            {calcStopPriceView(10, false)}
            {calcStopPriceView(5, false)}
            {calcStopPriceView(2, false)}
            {calcStopPriceView(1, false)}
        </div>
    )
};
