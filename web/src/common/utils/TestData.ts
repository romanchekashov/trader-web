import { SessionTradeResult } from "../data/SessionTradeResult";
import { ClassCode } from "../data/ClassCode";
import { ActiveTrade } from "../data/ActiveTrade";
import { OperationType } from "../data/OperationType";
import { StopOrderStatus } from "../data/StopOrderStatus";
import { Order } from "../data/Order";
import { OrderType } from "../data/OrderType";
import { StopOrder } from "../data/StopOrder";
import { PossibleTrade } from "../../app/possibleTrades/data/PossibleTrade";
import { Interval } from "../data/Interval";
import { TrendDirection } from "../data/strategy/TrendDirection";
import { SecurityType } from "../data/security/SecurityType";
import { StopOrderKind } from "../data/StopOrderKind";

export const TEST_SESSION_RESULT: SessionTradeResult = {
  classCode: ClassCode.SPBFUT,
  secCode: "BRM0",
  plPrice: 32,
  plStop: 31,
  plTarget: 34,
  start: new Date(),
  trades: [],
};

export const TEST_ACTIVE_TRADES: ActiveTrade[] = [
  {
    secId: 372,
    avgPrice: 34,
    quantity: 5,
    operation: OperationType.SELL,
    plPrice: 123,
    plStop: 23,
    plTarget: 200,
    start: new Date(),
    trades: [],
    targets: [],
    stopOrder: {
      transId: 1,
      number: 2,
      linkedOrderNum: "2",
      securityType: SecurityType.FUTURE,
      secCode: "BRM0",
      secId: 372,
      operation: OperationType.BUY,
      price: 33,
      conditionPrice: 33.2,
      quantity: 5,
      status: StopOrderStatus.ACTIVE,
      dateTime: new Date(),
      kind: StopOrderKind.SIMPLE_STOP_ORDER,
    },
  },
  {
    secId: 370,
    avgPrice: 136900,
    quantity: 5,
    operation: OperationType.SELL,
    plPrice: 123,
    plStop: 23,
    plTarget: 200,
    start: new Date(),
    trades: [],
    targets: [],
    stopOrder: {
      transId: 1,
      number: 2,
      linkedOrderNum: "2",
      securityType: SecurityType.FUTURE,
      secCode: "RIH1",
      secId: 370,
      operation: OperationType.BUY,
      price: 136930,
      conditionPrice: 136990,
      quantity: 5,
      status: StopOrderStatus.ACTIVE,
      dateTime: new Date(),
      kind: StopOrderKind.SIMPLE_STOP_ORDER,
    },
  },
];

const orders: Order[] = [
  {
    id: 1,
    orderNum: "1",
    operation: OperationType.BUY,
    secId: 372,
    price: 67.5,
    quantity: 5,
    type: OrderType.LIMIT,
  },
];

const stops: StopOrder[] = [
  {
    transId: 11,
    operation: OperationType.BUY,
    securityType: SecurityType.FUTURE,
    secCode: "BRM1",
    secId: 372,
    price: 68,
    conditionPrice: 68.02,
    quantity: 5,
    kind: StopOrderKind.SIMPLE_STOP_ORDER,
  },
];

const possibleTrade: PossibleTrade = {
  secId: 372,
  timeFrame: Interval.M30,
  timeFrameLow: Interval.M3,
  plStop: 1303.56,
  plTarget: 1789.62,
  operation: OperationType.SELL,
  quantity: 3,
  entryPrice: 68,
  stopPrice: 68.59,
  targets: [
    {
      quantity: 1,
      price: 67.19,
    },
    {
      quantity: 1,
      price: 66.97,
    },
    {
      quantity: 1,
      price: 67.41,
    },
  ],
  stopTrendPoint: {
    swingHL: 68.54,
    dateTime: new Date("2021-05-07T17:00:00+03:00"),
    minimum: false,
    candle: {
      secId: 372,
      symbol: "BR",
      interval: Interval.M30,
      timestamp: new Date("2021-05-07T17:00:00+03:00"),
      open: 68.35,
      high: 68.54,
      low: 67.79,
      close: 67.82,
      volume: 166791.0,
    },
    trendDirection: TrendDirection.UP,
  },
};

export default {
  orders,
  stops,
  possibleTrade,
};
