import * as React from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Security } from "../../../data/security/Security";
import { round } from "../../../utils/utils";
import { Order } from "../../../data/Order";
import { OrderType } from "../../../data/OrderType";
import { OperationType } from "../../../data/OperationType";
import {
  ChartManageOrder,
  ChartManageOrderType,
} from "../data/ChartManageOrder";
import { StopOrder } from "../../../data/StopOrder";
import { InputText } from "primereact/inputtext";
import { SelectButton } from "primereact/selectbutton";

const _ = require("lodash");

type Props = {
  securityInfo: Security;
  stops: StopOrder[];
  orders: Order[];
  showModal: boolean;
  alert: any;
  chartId: any;
  onClose: () => void;
  onSave: (alert: any, chartId: any, manageOrder: ChartManageOrder) => void;
  onDeleteAlert: () => void;
};

type State = {
  alert: any;
  type: ChartManageOrderType;
  operationType: OperationType;
  quantity: number;
  stopPrice: number;
  order: Order;
};

export class ChartDialog extends React.Component<Props, State> {
  typeSets = [
    { label: "Order", value: "order" },
    { label: "Stop", value: "stop" },
  ];

  btnSets = [
    { label: "Buy", value: OperationType.BUY },
    { label: "Sell", value: OperationType.SELL },
  ];

  quantitySets = [
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "4", value: 4 },
    { label: "5", value: 5 },
    { label: "10", value: 10 },
    { label: "15", value: 15 },
    { label: "20", value: 20 },
    { label: "25", value: 25 },
  ];

  constructor(props) {
    super(props);
    this.state = {
      alert: props.alert,
      type: "order",
      operationType: OperationType.BUY,
      quantity: 1,
      order: null,
      stopPrice: 0,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  static getDerivedStateFromProps = (props, state) => {
    if (props.alert && props.alert.id !== state.alert?.id) {
      return {
        alert: props.alert,
        type: props.alert.id.startsWith("stop_") ? "stop" : "order",
        stopPrice: ChartDialog.calcStopPrice(
          state.operationType,
          props.alert.yValue,
          props.securityInfo
        ),
      };
    }

    return null;
  };

  static calcStopPrice = (
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

  // componentWillReceiveProps = (nextProps) => {
  //     const {showModal, securityInfo} = this.props
  //     const {operationType} = this.state
  //
  //     if (nextProps.alert && showModal != nextProps.showModal) {
  //         nextProps.alert.yValue = round(nextProps.alert.yValue, securityInfo.scale)
  //         this.setState({
  //             alert: nextProps.alert,
  //             type: nextProps.alert.id.startsWith("stop_") ? 'stop' : 'order',
  //             stopPrice: ChartDialog.calcStopPrice(operationType, nextProps.alert.yValue, securityInfo)
  //         })
  //     }
  // }

  handleOperationTypeChange = (operationType: OperationType) => {
    const { securityInfo } = this.props;
    const { alert } = this.state;

    this.setState({
      operationType,
      stopPrice: ChartDialog.calcStopPrice(
        operationType,
        alert.yValue,
        securityInfo
      ),
    });
  };

  handleChange = (e) => {
    const { securityInfo } = this.props;
    const { alert, operationType } = this.state;
    const price = Number(e.target.value);

    this.setState({
      alert: {
        ...alert,
        yValue: price,
      },
      stopPrice: ChartDialog.calcStopPrice(operationType, price, securityInfo),
    });
  };

  handleStopPriceChange = (e) => {
    this.setState({
      stopPrice: Number(e.target.value),
    });
  };

  getOrderAndStopMap = _.memoize((orders: Order[], stops: StopOrder[]) => {
    const map = {};
    if (orders && orders.length > 0) {
      for (const order of orders) {
        map["order_" + order.orderNum] = order;
      }
    }
    if (stops && stops.length > 0) {
      for (const stop of stops) {
        map["stop_" + stop.transId] = stop;
      }
    }
    return map;
  });

  handleSave = () => {
    const { chartId, securityInfo, orders, stops, onSave } = this.props;
    const { alert, quantity, type, operationType, stopPrice } = this.state;
    const orderAndStopMap = this.getOrderAndStopMap(orders, stops);

    const cancelOrder = alert.id.startsWith("order_")
      ? orderAndStopMap[alert.id]
      : null;
    const cancelStopOrder = alert.id.startsWith("stop_")
      ? orderAndStopMap[alert.id]
      : null;

    if (type === "order") {
      onSave(alert, chartId, {
        type,
        createOrder: {
          secId: securityInfo.id,
          price: alert.yValue,
          quantity,
          operation: operationType,
          type: OrderType.LIMIT,
          classCode: securityInfo.classCode,
          secCode: securityInfo.secCode,
        },
        cancelOrder,
      });
    } else {
      onSave(alert, chartId, {
        type,
        createStopOrder: {
          classCode: securityInfo.classCode,
          secCode: securityInfo.secCode,
          price: stopPrice,
          conditionPrice: alert.yValue,
          quantity,
          operation: operationType,
        },
        cancelStopOrder,
      });
    }
  };

  onEnterPressed = (e) => {
    if (e.key === "Enter") {
      this.handleSave();
    }
  };

  footer = (
    <div>
      <Button
        label="Delete Alert"
        icon="pi pi-check"
        onClick={this.props.onDeleteAlert}
      />
      <Button label="Save" icon="pi pi-times" onClick={this.handleSave} />
    </div>
  );

  render() {
    const { showModal, onClose, securityInfo } = this.props;
    const { alert, type, operationType, quantity, stopPrice } = this.state;

    if (!showModal) return null;

    const header = alert.id.startsWith("order_")
      ? "Edit Order"
      : alert.id.startsWith("stop_")
      ? "Edit Stop"
      : "Edit Alert";

    return (
      <Dialog
        header={header}
        footer={this.footer}
        visible={showModal}
        style={{ width: "50vw" }}
        position="bottom"
        modal={true}
        onHide={onClose}
      >
        <div className="p-grid">
          {header === "Edit Alert" ? (
            <div className="p-col-3">
              <SelectButton
                value={type}
                options={this.typeSets}
                onChange={(e) => this.setState({ type: e.value })}
              />
            </div>
          ) : null}
          <div className="p-col-3">
            <SelectButton
              value={operationType}
              options={this.btnSets}
              onChange={(e) => this.handleOperationTypeChange(e.value)}
            />
          </div>
          <div className="p-col-12">
            <SelectButton
              value={quantity}
              options={this.quantitySets}
              onChange={(e) => this.setState({ quantity: e.value })}
            />
          </div>
          {type === "order" ? (
            <div className="p-col-12">
              <label htmlFor="chart-dialog-alert-price">Price: </label>
              <InputText
                id="chart-dialog-alert-price"
                type="number"
                step={securityInfo.secPriceStep}
                value={alert.yValue}
                onKeyDown={this.onEnterPressed}
                onChange={this.handleChange}
              />
            </div>
          ) : (
            <>
              <div className="p-col-12">
                <label htmlFor="chart-dialog-alert-price">
                  Condition Price:{" "}
                </label>
                <InputText
                  id="chart-dialog-alert-price"
                  type="number"
                  step={securityInfo.secPriceStep}
                  value={alert.yValue}
                  onKeyDown={this.onEnterPressed}
                  onChange={this.handleChange}
                />
              </div>
              <div className="p-col-12">
                <label htmlFor="chart-dialog-alert-price">Stop Price: </label>
                <InputText
                  id="chart-dialog-alert-price"
                  type="number"
                  step={securityInfo.secPriceStep}
                  value={stopPrice}
                  onKeyDown={this.onEnterPressed}
                  onChange={this.handleStopPriceChange}
                />
              </div>
            </>
          )}
        </div>
      </Dialog>
    );
  }
}
