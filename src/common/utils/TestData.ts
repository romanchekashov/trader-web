import {SessionTradeResult} from "../data/SessionTradeResult";
import {ClassCode} from "../data/ClassCode";
import {ActiveTrade} from "../data/ActiveTrade";
import {OperationType} from "../data/OperationType";
import {StopOrderStatus} from "../data/StopOrderStatus";

export const TEST_SESSION_RESULT: SessionTradeResult = {
    classCode: ClassCode.SPBFUT,
    secCode: "BRM0",
    plPrice: 32,
    plStop: 31,
    plTarget: 34,
    start: new Date(),
    trades: []
}

export const TEST_ACTIVE_TRADES: ActiveTrade[] = [
    {
        classCode: ClassCode.SPBFUT,
        secCode: "BRM0",
        avgPrice: 34,
        stopOrder: {
            transId: 1,
            number: 2,
            linkedOrderNum: "2",
            classCode: ClassCode.SPBFUT,
            secCode: "BRM0",
            operation: OperationType.BUY,
            price: 33,
            conditionPrice: 33.2,
            quantity: 5,
            status: StopOrderStatus.ACTIVE,
            dateTime: new Date()
        },
        quantity: 5,
        operation: OperationType.SELL,
        plPrice: 123,
        plStop: 23,
        plTarget: 200,
        start: new Date(),
        trades: []
    }, {
        classCode: ClassCode.SPBFUT,
        secCode: "RIH1",
        avgPrice: 136900,
        stopOrder: {
            transId: 1,
            number: 2,
            linkedOrderNum: "2",
            classCode: ClassCode.SPBFUT,
            secCode: "RIH1",
            operation: OperationType.BUY,
            price: 136930,
            conditionPrice: 136990,
            quantity: 5,
            status: StopOrderStatus.ACTIVE,
            dateTime: new Date()
        },
        quantity: 5,
        operation: OperationType.SELL,
        plPrice: 123,
        plStop: 23,
        plTarget: 200,
        start: new Date(),
        trades: []
    }
]