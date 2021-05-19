import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { SelectButton } from "primereact/selectbutton";
import { ToggleButton } from "primereact/togglebutton";
import * as React from "react";
import { useEffect, useState } from "react";
import { WebsocketService, WSEvent } from "../../../api/WebsocketService";
import { OperationType } from "../../../data/OperationType";
import { Order } from "../../../data/Order";
import { OrderType } from "../../../data/OrderType";
import { SecurityLastInfo } from "../../../data/security/SecurityLastInfo";
import { PrimeDropdownItem, round } from "../../../utils/utils";

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
  const multipliers: PrimeDropdownItem<number>[] = [1, 2, 4, 8].map((val) => ({
    label: "" + val,
    value: val,
  }));
  const [price, setPrice] = useState<number>(0);
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
  }, [security?.id]);

  const createOrder = (operation: OperationType) => {
    const orders: Order[] = [
      {
        secId: security.id,
        price,
        quantity,
        operation,
        type: OrderType.LIMIT,
        classCode: security.classCode,
        secCode: security.secCode,
      },
    ];

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
    // console.log(orders)
    WebsocketService.getInstance().send(
      history ? WSEvent.HISTORY_CREATE_ORDERS : WSEvent.CREATE_ORDERS,
      orders
    );
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

  return (
    <div className="p-grid">
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
          <label htmlFor="td__control-panel-price">Price</label>
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
          <label htmlFor="td__control-panel-price">Stop</label>
        </span>
      </div>
      <div className="p-col-6">
        <Button
          label="Buy"
          className="p-button-success"
          style={{ width: "100%", paddingTop: 4, paddingBottom: 4 }}
          onClick={() => {
            createOrder(OperationType.BUY);
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
            createOrder(OperationType.SELL);
          }}
          disabled={!security}
        />
      </div>
    </div>
  );
};
