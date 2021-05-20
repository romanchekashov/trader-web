import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { SelectButton } from "primereact/selectbutton";
import { ToggleButton } from "primereact/togglebutton";
import * as React from "react";
import { useEffect, useState } from "react";
import { selectDeposits } from "../../../../app/deposits/depositsSlice";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import quikOrdersApi from "../../../../app/orders/quikOrdersApi";
import { createStop } from "../../../../app/stops/stopsSlice";
import { WebsocketService, WSEvent } from "../../../api/WebsocketService";
import { ClassCode } from "../../../data/ClassCode";
import { OperationType } from "../../../data/OperationType";
import { Order } from "../../../data/Order";
import { OrderType } from "../../../data/OrderType";
import { Security } from "../../../data/security/Security";
import { SecurityLastInfo } from "../../../data/security/SecurityLastInfo";
import { StopOrder } from "../../../data/StopOrder";
import { StopOrderKind } from "../../../data/StopOrderKind";
import {
  ClassCodeToSecTypeMap,
  PrimeDropdownItem,
  round,
} from "../../../utils/utils";
import "./ControlPanelGeneralBtn.css";

enum ControlOrderType {
  ORDER = "O",
  STOP_TARGET = "S+T",
  TARGET = "T",
  STOP = "S",
}

const typeSets = [
  { label: "O", value: ControlOrderType.ORDER },
  { label: "S+T", value: ControlOrderType.STOP_TARGET },
  { label: "T", value: ControlOrderType.TARGET },
  { label: "S", value: ControlOrderType.STOP },
];

type Props = {
  security: SecurityLastInfo;
  history?: boolean;
  growl: any;
};

type States = {
  price: number;
  quantity: number;
  steps: number;
  multiplier: number;
  btnSet: string;
  isMarket: boolean;
};

export const ControlPanelGeneralBtn: React.FC<Props> = ({
  security,
  history,
  growl,
}) => {
  const dispatch = useAppDispatch();
  const { futuresClientLimits } = useAppSelector(selectDeposits);

  const multipliers: PrimeDropdownItem<number>[] = [1, 2, 4, 8].map((val) => ({
    label: "" + val,
    value: val,
  }));
  const [price, setPrice] = useState<number>(0);
  const [price2, setPrice2] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [steps, setSteps] = useState<number>(2);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [btnSet, setBtnSet] = useState<string>("general");
  const [isMarket, setIsMarket] = useState<boolean>(false);
  const [controlOrderType, setControlOrderType] = useState<ControlOrderType>(
    ControlOrderType.ORDER
  );

  const quantityChangeByKeydown = (e) => {
    if (e.key === "ArrowUp") {
      setQuantity(quantity + 1);
    } else if (e.key === "ArrowDown" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const priceChangeByKeydown = (e) => {
    if (e.key === "ArrowUp") {
      setPrice(round(price + security.secPriceStep, security.scale));
    } else if (e.key === "ArrowDown" && price > 0) {
      setPrice(round(price - security.secPriceStep, security.scale));
    }
  };

  useEffect(() => {
    document
      .getElementById("td__control-panel-price")
      .addEventListener("keydown", priceChangeByKeydown);

    return () => {
      document
        .getElementById("td__control-panel-price")
        .removeEventListener("keydown", priceChangeByKeydown);
    };
  }, []);

  useEffect(() => {
    setPrice(security?.lastTradePrice || 0);
    setPrice2(security?.lastTradePrice || 0);
    if (
      futuresClientLimits.length &&
      security?.classCode === ClassCode.SPBFUT
    ) {
      let go = Math.min(
        security.futureBuyDepoPerContract,
        security.futureSellDepoPerContract
      );
      let maxQuantity = Math.floor(futuresClientLimits[0].cbplplanned / go);
      setQuantity(maxQuantity);
    }
  }, [security?.id, futuresClientLimits]);

  const calcStopPrice = (
    operationType: OperationType,
    price: number,
    securityInfo: Security
  ) => {
    const priceDiff = securityInfo.secPriceStep * 2;
    const stopPrice =
      operationType === OperationType.BUY
        ? price + priceDiff
        : price - priceDiff;

    return round(stopPrice, securityInfo.scale);
  };

  const createOrder = (operation: OperationType) => {
    const order: Order = {
      secId: security.id,
      classCode: security.classCode,
      secCode: security.secCode,
      price,
      quantity,
      operation,
      type: isMarket ? OrderType.MARKET : OrderType.LIMIT,
    };

    if (operation === OperationType.BUY && price > security.lastTradePrice) {
      growl.show({
        severity: "error",
        summary: "Error Message",
        detail: "Cannot buy greater then current price!",
      });
      return;
    }
    if (operation === OperationType.SELL && price < security.lastTradePrice) {
      growl.show({
        severity: "error",
        summary: "Error Message",
        detail: "Cannot sell chipper then current price!",
      });
      return;
    }

    quikOrdersApi.createOrder(order).then((order) => {
      growl.show({
        severity: "success",
        summary: "Success Message",
        detail: "Order created",
      });
    });
    // console.log(orders)
    // WebsocketService.getInstance().send(
    //   history ? WSEvent.HISTORY_CREATE_ORDERS : WSEvent.CREATE_ORDERS,
    //   orders
    // );
  };

  const createStopAndTarget = (operation: OperationType) => {
    const order: StopOrder = {
      secId: security.id,
      securityType: ClassCodeToSecTypeMap[security.classCode],
      secCode: security.secCode,
      kind: StopOrderKind.TAKE_PROFIT_AND_STOP_LIMIT_ORDER,
      quantity,
      operation,
      conditionPrice2: calcStopPrice(operation, price, security), // stop
      price,
      conditionPrice: price2, // target
    };

    if (operation === OperationType.BUY && price > security.lastTradePrice) {
      growl.show({
        severity: "error",
        summary: "Error Message",
        detail: "Cannot buy greater then current price!",
      });
      return;
    }
    if (operation === OperationType.SELL && price < security.lastTradePrice) {
      growl.show({
        severity: "error",
        summary: "Error Message",
        detail: "Cannot sell chipper then current price!",
      });
      return;
    }

    dispatch(createStop(order)).then((result) => {
      console.log(result);
      // growl.show({
      //   severity: "success",
      //   summary: "Success Message",
      //   detail: "Order created",
      // });
    });
  };

  const createStopOrder = (operation: OperationType) => {
    const order: StopOrder = {
      secId: security.id,
      securityType: ClassCodeToSecTypeMap[security.classCode],
      secCode: security.secCode,
      kind: StopOrderKind.SIMPLE_STOP_ORDER,
      quantity,
      operation,
      conditionPrice: calcStopPrice(operation, price, security), // stop
      price,
    };

    if (operation === OperationType.BUY && price > security.lastTradePrice) {
      growl.show({
        severity: "error",
        summary: "Error Message",
        detail: "Cannot buy greater then current price!",
      });
      return;
    }
    if (operation === OperationType.SELL && price < security.lastTradePrice) {
      growl.show({
        severity: "error",
        summary: "Error Message",
        detail: "Cannot sell chipper then current price!",
      });
      return;
    }

    dispatch(createStop(order)).then((result) => {
      console.log(result);
      // growl.show({
      //   severity: "success",
      //   summary: "Success Message",
      //   detail: "Order created",
      // });
    });
  };

  const createTargetOrder = (operation: OperationType) => {
    const order: StopOrder = {
      secId: security.id,
      securityType: ClassCodeToSecTypeMap[security.classCode],
      secCode: security.secCode,
      kind: StopOrderKind.TAKE_PROFIT_STOP_ORDER,
      quantity,
      operation,
      conditionPrice: price,
    };

    if (operation === OperationType.BUY && price > security.lastTradePrice) {
      growl.show({
        severity: "error",
        summary: "Error Message",
        detail: "Cannot buy greater then current price!",
      });
      return;
    }
    if (operation === OperationType.SELL && price < security.lastTradePrice) {
      growl.show({
        severity: "error",
        summary: "Error Message",
        detail: "Cannot sell chipper then current price!",
      });
      return;
    }

    dispatch(createStop(order)).then((result) => {
      console.log(result);
      // growl.show({
      //   severity: "success",
      //   summary: "Success Message",
      //   detail: "Order created",
      // });
    });
  };

  const create = (operation: OperationType) => {
    switch (controlOrderType) {
      case ControlOrderType.ORDER:
        createOrder(operation);
        break;
      case ControlOrderType.STOP:
        createStopOrder(operation);
        break;
      case ControlOrderType.TARGET:
        createTargetOrder(operation);
        break;
      case ControlOrderType.STOP_TARGET:
        createStopAndTarget(operation);
        break;
    }
  };

  const changeOrder = () => {
    WebsocketService.getInstance().send(
      history ? WSEvent.HISTORY_CHANGE_ORDERS : WSEvent.CHANGE_ORDERS
    );
  };

  const cancelOrder = () => {
    WebsocketService.getInstance().send(
      history ? WSEvent.HISTORY_CANCEL_ORDERS : WSEvent.CANCEL_ORDERS
    );
  };

  const priceLabel =
    controlOrderType === ControlOrderType.ORDER
      ? "Price"
      : controlOrderType === ControlOrderType.TARGET
      ? "Target"
      : "Stop";

  return (
    <div className="p-grid ControlPanelGeneralBtn">
      <div className="p-col-8">
        <SelectButton
          value={controlOrderType}
          options={typeSets}
          onChange={(e) => setControlOrderType(e.value)}
        />
      </div>
      <div className="p-col-4">
        <ToggleButton
          style={{ width: "100%" }}
          checked={isMarket}
          className={isMarket ? "p-button-danger" : ""}
          onLabel="Market"
          offLabel="Limit"
          onChange={(e) => setIsMarket(e.value)}
        />
      </div>
      <div className="p-col-4" style={{ marginTop: 5 }}>
        <span className="p-float-label">
          <InputText
            id="td__control-panel-quantity"
            style={{ width: 90 }}
            type="number"
            step={1}
            value={quantity}
            // onKeyDown={quantityChangeByKeydown}
            onChange={(e) => setQuantity(parseInt(e.target["value"]))}
          />
          <label htmlFor="td__control-panel-quantity">Quantity</label>
        </span>
      </div>
      <div className="p-col-4" style={{ marginTop: 5 }}>
        <span className="p-float-label">
          <InputText
            id="td__control-panel-price"
            style={{ width: 90 }}
            type="number"
            step={security?.secPriceStep || 1}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
          <label htmlFor="td__control-panel-price">{priceLabel}</label>
        </span>
      </div>
      {controlOrderType === ControlOrderType.STOP_TARGET ? (
        <div className="p-col-4" style={{ marginTop: 5 }}>
          <span className="p-float-label">
            <InputText
              id="td__control-panel-price"
              style={{ width: 90 }}
              type="number"
              step={security?.secPriceStep || 1}
              value={price2}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
            <label htmlFor="td__control-panel-price">Target</label>
          </span>
        </div>
      ) : null}
      <div className="p-col-6">
        <Button
          label="Buy"
          className="p-button-success"
          style={{ width: "100%", paddingTop: 4, paddingBottom: 4 }}
          onClick={() => {
            create(OperationType.BUY);
          }}
          disabled={!security}
        />
      </div>
      <div className="p-col-6">
        <Button
          label="Sell"
          className="p-button-danger"
          style={{ width: "100%", paddingTop: 4, paddingBottom: 4 }}
          onClick={() => {
            create(OperationType.SELL);
          }}
          disabled={!security}
        />
      </div>
    </div>
  );
};
