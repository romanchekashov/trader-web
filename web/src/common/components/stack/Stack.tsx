import moment = require("moment");
import { Toast } from "primereact/toast";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import {
  selectActiveTrades,
  setSelectedActiveTrade
} from "../../../app/activeTrades/activeTradesSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { deleteOrder, selectOrders } from "../../../app/orders/ordersSlice";
import quikOrdersApi from "../../../app/orders/quikOrdersApi";
import { selectSecurities } from "../../../app/securities/securitiesSlice";
import { selectStops } from "../../../app/stops/stopsSlice";
import analysisRestApi from "../../api/rest/analysisRestApi";
import { WebsocketService, WSEvent } from "../../api/WebsocketService";
import { playSound } from "../../assets/assets";
import { ActiveTrade } from "../../data/ActiveTrade";
import { OperationType } from "../../data/OperationType";
import { Order } from "../../data/Order";
import { OrderType } from "../../data/OrderType";
import { StopOrder } from "../../data/StopOrder";
import { TradePremise } from "../../data/strategy/TradePremise";
import { adjustTradePremise } from "../../utils/DataUtils";
import intervalCompare from "../../utils/IntervalComporator";
import { getRecentBusinessDate } from "../../utils/utils";
import { StackItem } from "./data/StackItem";
import { StackItemWrapper } from "./data/StackItemWrapper";
import "./Stack.css";
import { StackItemView } from "./StackItemView";
import { StackEvent, StackService } from "./StackService";
import { StackSwitcher } from "./StackSwitcher";
import { SecurityVolume } from "./volumes/data/SecurityVolume";
import { SecurityVolumeWrapper } from "./volumes/data/SecurityVolumeWrapper";
import StackVolumes from "./volumes/StackVolumes";

type Props = {};

let previousOrdersNumber: number = 0;
let previousStopOrder: StopOrder;
// TestData
// this.setState({
//     activeTrades: TEST_ACTIVE_TRADES,
//     selectedActiveTrade: TEST_ACTIVE_TRADES[0],
//     securityLastInfo: sec,
//     stackItems: [
//         {
//             price: sec.lastTradePrice,
//             quantity: 1,
//             sell: true
//         }, {
//             price: sec.lastTradePrice - sec.secPriceStep,
//             quantity: 1,
//             sell: false
//         }
//     ]
// })

export const Stack: React.FC<Props> = ({ }) => {
  const dispatch = useAppDispatch();
  const { security } = useAppSelector(selectSecurities);
  const { stops } = useAppSelector(selectStops);
  const { orders } = useAppSelector(selectOrders);
  const { activeTrades, selectedActiveTrade } =
    useAppSelector(selectActiveTrades);

  const toast = useRef(null);
  const [stackItemsHeight, setStackItemsHeight] = useState<number>(400);
  const [items, setItems] = useState<number[]>([]);
  const [stackItems, setStackItems] = useState<StackItem[]>([]);
  const [ordersMap, setOrdersMap] = useState<any>({});
  const [position, setPosition] = useState<number>(1);
  const [volumesWrapper, setVolumesWrapper] = useState<SecurityVolumeWrapper[]>([]);
  const [history, setHistory] = useState<boolean>(false);
  const [premise, setPremise] = useState<TradePremise>(null);

  const MOUSE_BTN_LEFT = 0;
  const MOUSE_BTN_WHEEL = 1;
  const MOUSE_BTN_RIGHT = 2;
  const MOUSE_BTN_BACKWARD = 3;
  const MOUSE_BTN_FORWARD = 4;

  useEffect(() => {
    updateSize();
    window.addEventListener("resize", updateSize);

    document
      .getElementById("stack-items-wrap-id")
      .addEventListener("contextmenu", blockContextMenu);

    const stackItemsSubscription = WebsocketService.getInstance()
      .on<StackItem[]>(WSEvent.STACK)
      .subscribe(setStackItems);

    const tradePremiseSubscription = WebsocketService.getInstance()
      .on<TradePremise>(WSEvent.TRADE_PREMISE)
      .subscribe((premise) => {
        if (!premise) adjustTradePremise(premise);
        setPremise(premise);
      });

    return () => {
      stackItemsSubscription.unsubscribe();
      tradePremiseSubscription.unsubscribe();

      window.removeEventListener("resize", updateSize);
      document
        .getElementById("stack-items-wrap-id")
        .removeEventListener("contextmenu", blockContextMenu);
    };
  }, []);

  useEffect(() => {
    notifyIfOrderHit(orders);
    setOrdersMap(getOrdersMap(orders));
  }, [orders]);

  useEffect(() => {
    if (activeTrades?.length) {
      notifyIfStopHit(activeTrades);
    }

    dispatch(
      setSelectedActiveTrade(
        activeTrades?.find((at) => at.secId === security?.id)
      )
    );
  }, [activeTrades, security?.id]);

  useEffect(() => {
    const volumesSubscription = WebsocketService.getInstance()
      .on<SecurityVolume[]>(WSEvent.VOLUMES)
      .subscribe(volumes => {
        if (volumesWrapper.length) volumesWrapper[0].volumes = volumes;
        setVolumesWrapper(volumesWrapper);
      });

    return () => {
      volumesSubscription.unsubscribe();
    };
  }, [volumesWrapper]);

  useEffect(() => {
    if (security?.id) {
      analysisRestApi.getSecurityVolumes({
        secCode: security.secCode,
        timestamp: moment(getRecentBusinessDate(moment().subtract(30, "days").toDate())).hours(6).minutes(0).seconds(0).toDate()
      }).then(setVolumesWrapper);
    }
  }, [security?.id]);

  const updateSize = () => {
    setStackItemsHeight(window.innerHeight);
  };

  const blockContextMenu = (evt) => {
    evt.preventDefault();
  };

  const notifyIfOrderHit = (orders: Order[]): void => {
    if (orders && orders.length !== previousOrdersNumber) {
      playSound(1);
      previousOrdersNumber = orders.length;
    }
  };

  const notifyIfStopHit = (newActiveTrades: ActiveTrade[]): void => {
    // todo
    // if ((!activeTrades && newActiveTrade) || (activeTrades && !newActiveTrade)) {
    //     playSound(2);
    //     if (newActiveTrade) {
    //         this.previousStopOrder = newActiveTrade.stopOrder;
    //     }
    // } else if (newActiveTrade && ((newActiveTrade.stopOrder && !this.previousStopOrder)
    //     || (!newActiveTrade.stopOrder && this.previousStopOrder)
    //     || (this.previousStopOrder && newActiveTrade.stopOrder.price !== this.previousStopOrder.price))) {
    //     playSound(2);
    //     this.previousStopOrder = newActiveTrade.stopOrder;
    // }
  };

  // shouldComponentUpdate(
  //   nextProps: Readonly<Props>,
  //   nextState: Readonly<States>,
  //   nextContext: any
  // ): boolean {
  //   const { stackItems } = this.state;
  //   if (
  //     stackItems &&
  //     nextState.stackItems &&
  //     stackItems.length > 0 &&
  //     stackItems.length === nextState.stackItems.length
  //   ) {
  //     const index = stackItems.length / 2;
  //     if (
  //       stackItems[index].price === nextState.stackItems[index].price &&
  //       stackItems[index].quantity === nextState.stackItems[index].quantity
  //     ) {
  //       return false;
  //     }
  //   }

  //   return true;
  // }

  const clickOnStackItem = (e: any, val: any) => {
    let mouseBtn = "";
    switch (e.button) {
      case MOUSE_BTN_LEFT:
        mouseBtn = "left";
        break;
      case MOUSE_BTN_RIGHT:
        mouseBtn = "right";
        if (e.ctrlKey) {
          createStopOrder(val);
        } else {
          const order = ordersMap[val.price];
          if (order) {
            cancelOrder(order);
          } else {
            createOrder(val);
          }
        }
        break;
    }
    console.log("clicked: " + mouseBtn, e, val);
  };

  const createStopOrder = (val: any) => {
    console.log("need impl!", val);
    // const { securityLastInfo } = this.state;
    // quikStopOrdersApi.createStopOrder({
    //   classCode: securityLastInfo.classCode,
    //   secCode: securityLastInfo.secCode,
    //   stop: val.price,
    // }).catch((reason) => {
    //   console.log("[ERROR](createStopOrder): " + reason);
    // });
  };

  const createOrder = (val: any) => {
    const order: Order = {
      secId: security.id,
      price: val.price,
      quantity: position,
      operation:
        val.price > security.lastTradePrice
          ? OperationType.SELL
          : OperationType.BUY,
      type: OrderType.LIMIT,
      classCode: security.classCode,
      secCode: security.secCode,
    };

    quikOrdersApi.createOrder(order).then((order) => {
      toast.current.show({
        severity: "success",
        summary: "Success Message",
        detail: "Order created",
      });
    });
  };

  const cancelOrder = ({ orderNum }: Order) => {
    dispatch(deleteOrder(orderNum));
  };

  const getOrdersMap = (orders: Order[]): any => {
    const map = {};
    for (let i = 0, len = orders.length; i < len; i++) {
      const order = orders[i];
      if (map[order.price]) {
        map[order.price].quantity += order.quantity;
      } else {
        map[order.price] = order;
      }
    }
    return map;
  };

  const createStackViewNew = (): StackItemWrapper[] => {
    if (stackItems.length === 0 || !security) return [];
    const stackItemMap = {};
    for (const stackItem of stackItems) {
      stackItemMap[stackItem.price] = stackItem;
    }

    const multiplier = Math.pow(10, security.scale);
    const step = security.secPriceStep * multiplier;
    const offset = 20 * step;
    const stackItemsStartPrice = Math.round(stackItems[0].price * multiplier);
    const stackItemsEndPrice = Math.round(
      stackItems[stackItems.length - 1].price * multiplier
    );
    let price = stackItemsStartPrice + offset;
    const endPrice = stackItemsEndPrice - offset;
    const stackItemWrappers: StackItemWrapper[] = [];
    const stackItem10 = step * 10;
    const stackItem5 = step * 5;

    while (price > endPrice) {
      let style = {};
      let value = {
        price: price / multiplier,
        quantity: 0,
        sell: undefined,
      };

      if (stackItemMap[value.price]) {
        value = stackItemMap[value.price];
        if (value.sell !== undefined) {
          style = { backgroundColor: value.sell ? "#e74c3c44" : "#16a08544" };
        }
      }

      let className = "stack-item";
      if (price % stackItem10 === 0) {
        className += " stack-item-10";
      } else if (price % stackItem5 === 0) {
        className += " stack-item-5";
      }

      let stackItemOrderClassName = "stack-item-order";
      const order = ordersMap[value.price];
      let quantity = 0;
      if (order) {
        if (order.operation === OperationType.BUY) {
          stackItemOrderClassName += " limit-order-buy";
          quantity += order.quantity;
        } else {
          stackItemOrderClassName += " limit-order-sell";
          quantity -= order.quantity;
        }
      }

      if (selectedActiveTrade) {
        if (value.price === selectedActiveTrade.avgPrice) {
          stackItemOrderClassName += " active-order";
          quantity = selectedActiveTrade.quantity;
        }
        if (
          selectedActiveTrade.stopOrder &&
          value.price === selectedActiveTrade.stopOrder.price
        ) {
          stackItemOrderClassName += " stop-order";
          quantity = selectedActiveTrade.stopOrder.quantity;
        }
      }

      stackItemWrappers.push({
        className,
        stackItemOrderClassName,
        style,
        price: value.price,
        quantity,
        item: {
          price: value.price,
          quantity: value.quantity,
          sell: value.sell,
        },
      });

      price -= step;
    }

    return fillWithPremise(stackItemWrappers);
  };

  const fillWithPremise = (items: StackItemWrapper[]): StackItemWrapper[] => {
    if (premise) {
      const srMap = {};
      premise.analysis.srLevels.forEach((value) => {
        if (
          !srMap[value.swingHL] ||
          intervalCompare(value.interval, srMap[value.swingHL]) > 0
        ) {
          srMap[value.swingHL] = value.interval;
        }
      });
      items.forEach((value) => (value.srInterval = srMap[value.price]));
    }
    return items;
  };

  const onSelectActiveTrade = (selectedActiveTrade: ActiveTrade): void => {
    setSelectedActiveTrade(selectedActiveTrade);
    StackService.getInstance().send(
      StackEvent.ACTIVE_TRADE_SELECTED,
      selectedActiveTrade
    );
  };

  const stackItemWrappers = createStackViewNew();

  return (
    <>
      <StackSwitcher
        onSelectedPosition={(pos) => {
          setPosition(pos);
        }}
      />
      <div className="td__stack-main">
        <Toast ref={toast} />
        <StackVolumes volumesWrapper={volumesWrapper} className="volumes-panel" />

        <div id="stack-items-wrap-id" className="p-grid stack-items-wrap">
          <div
            className="p-col-12 stack-items"
            style={{ height: stackItemsHeight }}
          >
            {stackItemWrappers.map((value) => (
              <StackItemView
                key={value.price}
                stackItemWrapper={value}
                onItemClick={clickOnStackItem}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
