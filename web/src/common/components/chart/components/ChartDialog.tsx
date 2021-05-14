import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { SelectButton } from "primereact/selectbutton";
import { ToggleButton } from "primereact/togglebutton";
import * as React from "react";
import { useEffect, useState } from "react";
import { PossibleTrade } from "../../../../app/possibleTrades/data/PossibleTrade";
import { CrudMode } from "../../../data/CrudMode";
import { DataType } from "../../../data/DataType";
import { OperationType } from "../../../data/OperationType";
import { OrderType } from "../../../data/OrderType";
import { Security } from "../../../data/security/Security";
import { round } from "../../../utils/utils";
import { AlertToEdit } from "../CandleStickChartForDiscontinuousIntraDay";
import { ChartManageOrder } from "../data/ChartManageOrder";
import { ChartManageOrderType } from "../data/ChartManageOrderType";

const typeSets = [
  { label: "Order", value: ChartManageOrderType.order },
  { label: "Stop", value: ChartManageOrderType.stop },
];

const btnSets = [
  { label: "Buy", value: OperationType.BUY },
  { label: "Sell", value: OperationType.SELL },
];

let yValuePrev;

type Props = {
  securityInfo: Security;
  showModal: boolean;
  alertToEdit: AlertToEdit;
  onClose: () => void;
  onSave: (alert: any, chartId: any, manageOrder: ChartManageOrder) => void;
  onDeleteAlert: () => void;
};

export const ChartDialog: React.FC<Props> = ({
  securityInfo,
  showModal,
  alertToEdit,
  onClose,
  onSave,
  onDeleteAlert,
}) => {
  const [operationType, setOperationType] = useState<OperationType>(
    OperationType.BUY
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [orderType, setOrderType] = useState<ChartManageOrderType>(
    ChartManageOrderType.order
  );
  const [price, setPrice] = useState<number>();
  const [stopPrice, setStopPrice] = useState<number>();
  const [isMarket, setIsMarket] = useState<boolean>(false);

  useEffect(() => {
    if (
      !alertToEdit ||
      !securityInfo ||
      yValuePrev === alertToEdit?.alert?.yValue
    )
      return;
    yValuePrev = alertToEdit?.alert?.yValue;
    console.log("ChartDialog: ", yValuePrev);

    const { alert, interactive } = alertToEdit;
    const { secPriceStep } = securityInfo;
    let operation = interactive?.data?.operation || OperationType.BUY;
    let quantity = interactive?.data?.quantity || 1;

    setOrderType(
      interactive?.dataType === DataType.STOP_ORDER
        ? ChartManageOrderType.stop
        : ChartManageOrderType.order
    );
    setOperationType(operation);
    setQuantity(quantity);

    if (alert) {
      let price = round(alert.yValue, securityInfo.scale);
      if (secPriceStep > 1) {
        price = price - (price % secPriceStep);
      }
      setPrice(price);
      setStopPrice(calcStopPrice(operation, price, securityInfo));
    }
  }, [alertToEdit, securityInfo]);

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

  const handleOperationTypeChange = (operationType: OperationType) => {
    setOperationType(operationType);
    setStopPrice(calcStopPrice(operationType, price, securityInfo));
  };

  const handleChange = (e) => {
    const price = Number(e.target.value);
    setPrice(price);
    setStopPrice(calcStopPrice(operationType, price, securityInfo));
  };

  const handleStopPriceChange = (e) => {
    setStopPrice(Number(e.target.value));
  };

  const handleSave = () => {
    const { chartId, interactive } = alertToEdit;
    const { dataType, data } = interactive;

    if (dataType === DataType.ORDER) {
      onSave(alert, chartId, {
        dataType,
        action: CrudMode.CREATE,
        data: {
          secId: securityInfo.id,
          price,
          quantity,
          operation: operationType,
          type: OrderType.LIMIT,
          classCode: securityInfo.classCode,
          secCode: securityInfo.secCode,
        },
      });
    }

    if (dataType === DataType.STOP_ORDER) {
      onSave(alert, chartId, {
        dataType,
        action: CrudMode.CREATE,
        data: {
          classCode: securityInfo.classCode,
          secCode: securityInfo.secCode,
          conditionPrice: price,
          price: stopPrice,
          quantity,
          operation: operationType,
        },
      });
    }

    if (dataType === DataType.POSSIBLE_TRADE) {
      const possibleTrade: PossibleTrade = { ...alertToEdit.interactive.data };
      possibleTrade.entryPrice = price;
      possibleTrade.operation = operationType;
      possibleTrade.quantity = quantity;
      onSave(alert, chartId, {
        dataType,
        action: CrudMode.CREATE,
        data: possibleTrade,
      });
    }
  };

  const onEnterPressed = (e) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  const footer = (
    <div>
      <Button label="Delete Alert" icon="pi pi-check" onClick={onDeleteAlert} />
      <Button label="Save" icon="pi pi-times" onClick={handleSave} />
    </div>
  );

  if (!showModal) return null;

  return (
    <Dialog
      header={alertToEdit?.alert.text}
      footer={footer}
      visible={showModal}
      style={{ width: "50vw" }}
      position="bottom"
      modal={true}
      onHide={onClose}
    >
      <div className="p-grid">
        <div className="p-col-3">
          <SelectButton
            value={orderType}
            options={typeSets}
            onChange={(e) => setOrderType(e.value)}
          />
        </div>
        <div className="p-col-3">
          <SelectButton
            value={operationType}
            options={btnSets}
            onChange={(e) => handleOperationTypeChange(e.value)}
          />
        </div>
        <div className="p-col-3">
          <ToggleButton
            style={{ width: "100%" }}
            checked={isMarket}
            className={isMarket ? "p-button-danger" : ""}
            onLabel="Market"
            offLabel="Limit"
            onChange={(e) => setIsMarket(e.value)}
          />
        </div>
      </div>
      <div className="p-grid">
        <div className="p-col-3">
          <label htmlFor="chart-dialog-alert-quantity">Quantity: </label>
          <InputText
            id="chart-dialog-alert-quantity"
            type="number"
            step={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>
        <div className="p-col-3">
          <label htmlFor="chart-dialog-alert-price">
            {orderType === "stop" ? "Condition " : ""}Price:{" "}
          </label>
          <InputText
            id="chart-dialog-alert-price"
            type="number"
            step={securityInfo.secPriceStep}
            value={price}
            onKeyDown={onEnterPressed}
            onChange={handleChange}
          />
        </div>
        {orderType === "stop" ? (
          <div className="p-col-3">
            <label htmlFor="chart-dialog-alert-price">Stop Price: </label>
            <InputText
              id="chart-dialog-alert-price"
              type="number"
              step={securityInfo.secPriceStep}
              value={stopPrice}
              onKeyDown={onEnterPressed}
              onChange={handleStopPriceChange}
            />
          </div>
        ) : null}
      </div>
    </Dialog>
  );
};
