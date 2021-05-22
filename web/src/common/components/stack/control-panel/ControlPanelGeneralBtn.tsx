import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { SelectButton } from "primereact/selectbutton";
import { ToggleButton } from "primereact/togglebutton";
import * as React from "react";
import { useEffect, useState } from "react";
import { selectActiveTrades } from "../../../../app/activeTrades/activeTradesSlice";
import { selectDeposits } from "../../../../app/deposits/depositsSlice";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import quikOrdersApi from "../../../../app/orders/quikOrdersApi";
import { PossibleTrade } from "../../../../app/possibleTrades/data/PossibleTrade";
import { PossibleTradeRequest } from "../../../../app/possibleTrades/data/PossibleTradeRequest";
import { tradePossibleTrade } from "../../../../app/possibleTrades/possibleTradesSlice";
import { createStop, selectStops } from "../../../../app/stops/stopsSlice";
import { WebsocketService, WSEvent } from "../../../api/WebsocketService";
import { BrokerId } from "../../../data/BrokerId";
import { ClassCode } from "../../../data/ClassCode";
import { OperationType } from "../../../data/OperationType";
import { Order } from "../../../data/Order";
import { OrderType } from "../../../data/OrderType";
import { Security } from "../../../data/security/Security";
import { SecurityLastInfo } from "../../../data/security/SecurityLastInfo";
import { StopOrder } from "../../../data/StopOrder";
import { StopOrderKind } from "../../../data/StopOrderKind";
import { TradingPlatform } from "../../../data/trading/TradingPlatform";
import {
  ClassCodeToSecTypeMap,
  PrimeDropdownItem,
  round,
} from "../../../utils/utils";
import "./ControlPanelGeneralBtn.css";

enum ControlOrderType {
  POSSIBLE_TRADE = "PT",
  ORDER = "O",
  STOP_TARGET = "S+T",
  TARGET = "T",
  STOP = "S",
}

const typeSets = [
  { label: "PT", value: ControlOrderType.POSSIBLE_TRADE },
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
  const { stops } = useAppSelector(selectStops);
  const { activeTrades, selectedActiveTrade } =
    useAppSelector(selectActiveTrades);

  const multipliers: PrimeDropdownItem<number>[] = [1, 2, 4, 8].map((val) => ({
    label: "" + val,
    value: val,
  }));
  const [quantity, setQuantity] = useState<number>(1);
  const [quantityMax, setQuantityMax] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [price2, setPrice2] = useState<number>(0);
  const [steps, setSteps] = useState<number>(2);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [btnSet, setBtnSet] = useState<string>("general");
  const [isMarket, setIsMarket] = useState<boolean>(true);
  const [controlOrderType, setControlOrderType] = useState<ControlOrderType>(
    ControlOrderType.POSSIBLE_TRADE
  );

  const quantityChangeByKeydown = (e) => {
    if (e.key === "ArrowUp") {
      setQuantity(quantity + 1);
    } else if (e.key === "ArrowDown" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  useEffect(() => {
    setPrice(security?.lastTradePrice || 0);
    setPrice2(security?.lastTradePrice || 0);
  }, [security?.id]);

  useEffect(() => {
    if (
      futuresClientLimits.length &&
      security?.classCode === ClassCode.SPBFUT
    ) {
      let go = Math.min(
        security.futureBuyDepoPerContract,
        security.futureSellDepoPerContract
      );
      let maxQuantity = Math.floor(futuresClientLimits[0].cbplplanned / go);
      setQuantityMax(maxQuantity);
    }
  }, [security?.id, futuresClientLimits, quantity]);

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

  const getAvailableStopQuantity = (order: StopOrder) => {
    const stopQuantityUsed = stops.reduce((accum, cur) => {
      if (cur.secId === security?.id && cur.operation === order.operation)
        return accum + cur.quantity;
      return accum;
    }, 0);

    if (selectedActiveTrade && selectedActiveTrade.secId === security?.id) {
      return selectedActiveTrade.quantity - stopQuantityUsed;
    }

    return quantityMax - stopQuantityUsed;
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
      conditionPrice2: price, // activate stop
      price: calcStopPrice(operation, price, security),
      conditionPrice: price2, // target
    };

    const availableQty = getAvailableStopQuantity(order);

    if (quantity <= 0 || quantity > availableQty) {
      growl.show({
        severity: "error",
        summary: "Error Message",
        detail: `Stop orders quantity already used! AvailableQty: ${availableQty}`,
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
      conditionPrice: price, // activate stop
      price: calcStopPrice(operation, price, security),
    };

    const availableQty = getAvailableStopQuantity(order);

    if (quantity <= 0 || quantity > availableQty) {
      growl.show({
        severity: "error",
        summary: "Error Message",
        detail: `Stop orders quantity already used! AvailableQty: ${availableQty}`,
      });
      return;
    }

    dispatch(createStop(order)).then((result: any) => {
      if (result.error) {
        growl.show({
          severity: "error",
          summary: "Error Message",
          detail: "Cannot create stop order",
        });
      } else {
        growl.show({
          severity: "success",
          summary: "Success Message",
          detail: "Stop Order created",
        });
      }
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

    const availableQty = getAvailableStopQuantity(order);

    if (quantity <= 0 || quantity > availableQty) {
      growl.show({
        severity: "error",
        summary: "Error Message",
        detail: `Stop orders quantity already used! AvailableQty: ${availableQty}`,
      });
      return;
    }

    dispatch(createStop(order)).then((result: any) => {
      if (result.error) {
        growl.show({
          severity: "error",
          summary: "Error Message",
          detail: "Cannot create target order",
        });
      } else {
        growl.show({
          severity: "success",
          summary: "Success Message",
          detail: "Target Order created",
        });
      }
    });
  };

  const createPossibleTrade = (operation: OperationType) => {
    const order: PossibleTradeRequest = {
      brokerId: BrokerId.ALFA_DIRECT,
      tradingPlatform: TradingPlatform.QUIK,
      secId: security.id,
      stopPrice: price,
      quantity,
      operation,
      depositAmount: 0,
      depositMaxRiskPerTradeInPercent: 1,
      orderType: isMarket ? OrderType.MARKET : OrderType.LIMIT,
    };

    if (quantity <= 0 || quantity > quantityMax) {
      growl.show({
        severity: "error",
        summary: "Error Message",
        detail: `Wrong quantity: ${quantity}`,
      });
      return;
    }

    dispatch(tradePossibleTrade(order)).then((result: any) => {
      if (result.error) {
        growl.show({
          severity: "error",
          summary: "Error Message",
          detail: "Cannot create Possible Trade",
        });
      } else {
        growl.show({
          severity: "success",
          summary: "Success Message",
          detail: "Possible Trade created",
        });
      }
    });
  };

  const create = (operation: OperationType) => {
    switch (controlOrderType) {
      case ControlOrderType.POSSIBLE_TRADE:
        createPossibleTrade(operation);
        break;
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

  const getPossibleTradeQuantity = (price: number, stop: number): number => {
    const depositMaxRiskPerTradeInPercent = 1;
    const depo = futuresClientLimits[0].cbplplanned;
    const maxLossPerTradeMoney = (depo * depositMaxRiskPerTradeInPercent) / 100;
    const stopEntryDiff = Math.abs(price - stop);

    let qty = 1;

    if (security?.classCode === ClassCode.SPBFUT) {
      const minStepPrice = security.futureStepPrice / security.secPriceStep;
      qty = maxLossPerTradeMoney / stopEntryDiff / minStepPrice;
      qty = Math.min(quantityMax, qty);
      qty = Math.floor(qty);
    }

    return qty;
  };

  const onChangePrice = (e) => {
    const price = Number(e.target.value);
    setPrice(price);
    if (controlOrderType === ControlOrderType.POSSIBLE_TRADE) {
      setQuantity(getPossibleTradeQuantity(security.lastTradePrice, price));
    }
  };

  const onChangePrice2 = (e) => {
    const price2 = Number(e.target.value);
    setPrice2(price2);
    if (controlOrderType === ControlOrderType.ORDER) {
      setQuantity(getPossibleTradeQuantity(price, price2));
    }
  };

  const priceLabel =
    controlOrderType === ControlOrderType.ORDER
      ? "Price"
      : controlOrderType === ControlOrderType.TARGET
      ? "Target"
      : "Stop";

  const price2Label =
    controlOrderType === ControlOrderType.ORDER ? "Stop (Risk)" : "Target";

  const buyDisabled =
    !security ||
    ((controlOrderType === ControlOrderType.STOP ||
      controlOrderType === ControlOrderType.STOP_TARGET) &&
      security?.lastTradePrice > price) ||
    (controlOrderType === ControlOrderType.TARGET &&
      security?.lastTradePrice < price) ||
    (controlOrderType === ControlOrderType.STOP_TARGET &&
      security?.lastTradePrice < price2) ||
    (controlOrderType === ControlOrderType.ORDER &&
      !isMarket &&
      security?.lastTradePrice < price) ||
    (controlOrderType === ControlOrderType.POSSIBLE_TRADE &&
      security?.lastTradePrice < price);

  const sellDisabled =
    !security ||
    ((controlOrderType === ControlOrderType.STOP ||
      controlOrderType === ControlOrderType.STOP_TARGET) &&
      security?.lastTradePrice < price) ||
    (controlOrderType === ControlOrderType.TARGET &&
      security?.lastTradePrice > price) ||
    (controlOrderType === ControlOrderType.STOP_TARGET &&
      security?.lastTradePrice > price2) ||
    (controlOrderType === ControlOrderType.ORDER &&
      !isMarket &&
      security?.lastTradePrice > price) ||
    (controlOrderType === ControlOrderType.POSSIBLE_TRADE &&
      security?.lastTradePrice > price);

  return (
    <div className="p-grid ControlPanelGeneralBtn">
      <div className="p-col-10">
        <SelectButton
          value={controlOrderType}
          options={typeSets}
          onChange={(e) => {
            if (ControlOrderType.POSSIBLE_TRADE === e.value) setIsMarket(true);
            setControlOrderType(e.value);
          }}
        />
      </div>
      <div className="p-col-2" style={{ paddingLeft: 0 }}>
        <ToggleButton
          style={{ width: "100%" }}
          checked={isMarket}
          className={isMarket ? "p-button-danger" : ""}
          onLabel="M"
          offLabel="L"
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
            min={1}
            value={quantity}
            // onKeyDown={quantityChangeByKeydown}
            onChange={(e) => setQuantity(parseInt(e.target["value"]))}
          />
          <label
            className="clickable_label"
            htmlFor="td__control-panel-quantity"
            onClick={() => setQuantity(quantityMax)}
          >
            Qty Max: {quantityMax}
          </label>
        </span>
      </div>
      <div className="p-col-4" style={{ marginTop: 5 }}>
        <span className="p-float-label">
          <InputText
            id="td__control-panel-price"
            style={{ width: 90 }}
            type="number"
            step={security?.secPriceStep || 1}
            min={0}
            value={price}
            onChange={onChangePrice}
          />
          <label htmlFor="td__control-panel-price">{priceLabel}</label>
        </span>
      </div>
      {controlOrderType === ControlOrderType.STOP_TARGET ||
      controlOrderType === ControlOrderType.ORDER ? (
        <div className="p-col-4" style={{ marginTop: 5 }}>
          <span className="p-float-label">
            <InputText
              id="td__control-panel-price"
              style={{ width: 90 }}
              type="number"
              step={security?.secPriceStep || 1}
              min={0}
              value={price2}
              onChange={onChangePrice2}
            />
            <label htmlFor="td__control-panel-price">{price2Label}</label>
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
          disabled={buyDisabled}
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
          disabled={sellDisabled}
        />
      </div>
    </div>
  );
};
