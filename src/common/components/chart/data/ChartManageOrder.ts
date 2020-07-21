import {Order} from "../../../data/Order";
import {StopOrder} from "../../../data/StopOrder";

export type ChartManageOrderType = 'order' | 'stop'

export class ChartManageOrder {
    public type: ChartManageOrderType
    public createOrder?: Order
    public cancelOrder?: Order
    public createStopOrder?: StopOrder
    public cancelStopOrder?: StopOrder
}