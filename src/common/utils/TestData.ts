import {SessionTradeResult} from "../data/SessionTradeResult";
import {ClassCode} from "../data/ClassCode";
import {ActiveTrade} from "../data/ActiveTrade";
import {OperationType} from "../data/OperationType";

export const sessionResult: SessionTradeResult = {
    classCode: ClassCode.SPBFUT,
    secCode: "BRM0",
    plPrice: 32,
    plStop: 31,
    plTarget: 34,
    start: new Date(),
    trades: []
};

export const activeTrade: ActiveTrade = {
    classCode: ClassCode.SPBFUT,
    secCode: "BRM0",
    avgPrice: 34,
    stopOrder: {
        price: 33, quantity: 5, active: true, classCode: ClassCode.SPBFUT, secCode: "BRM0",
        conditionPrice: 33.2, dateTime: new Date(), operation: OperationType.BUY, orderNum: 2, transId: 1
    },
    quantity: 5,
    operation: OperationType.SELL,
    plPrice: 123,
    plStop: 23,
    plTarget: 200,
    start: new Date(),
    trades: []
};