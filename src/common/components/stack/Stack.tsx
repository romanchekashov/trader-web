import * as React from "react";
import {Button} from "primereact/components/button/Button";
import "./Stack.css";
import StackVolumes from "./volumes/StackVolumes";
import {SubscriptionLike} from "rxjs";
import {StackItemView} from "./StackItemView";
import {StackItemWrapper} from "./data/StackItemWrapper";
import {StackSwitcher} from "./StackSwitcher";
import {StopCalc} from "./stop-calc/StopCalc";
import {SecurityLastInfo} from "../../data/SecurityLastInfo";
import {Order} from "../../data/Order";
import {SecurityVolume} from "./volumes/data/SecurityVolume";
import {StackItem} from "./data/StackItem";
import {WebsocketService, WSEvent} from "../../api/WebsocketService";
import {OperationType} from "../../data/OperationType";
import {createStop} from "../../api/rest/traderRestApi";
import {OrderType} from "../../data/OrderType";
import {roundByMultiplier} from "../../utils/utils";
import {ActiveTrade} from "../../data/ActiveTrade";
import {Security} from "../../data/Security";
import {getSecurity} from "../../utils/Cache";

type Props = {
    history?: boolean
    securityLastInfo: SecurityLastInfo
};

type States = {
    stackItemsHeight: number
    items: number[]
    stackItems: StackItem[]
    ordersMap: any
    position: number
    orders: Order[]
    volumes: SecurityVolume[]
    activeTrade: ActiveTrade
    securityInfo: Security
};

export class Stack extends React.Component<Props, States> {

    private stackItemsSubscription: SubscriptionLike = null;
    private ordersSetupSubscription: SubscriptionLike = null;
    private volumesSubscription: SubscriptionLike = null;
    private activeTradeSubscription: SubscriptionLike = null;

    MOUSE_BTN_LEFT = 0;
    MOUSE_BTN_WHEEL = 1;
    MOUSE_BTN_RIGHT = 2;
    MOUSE_BTN_BACKWARD = 3;
    MOUSE_BTN_FORWARD = 4;

    constructor(props) {
        super(props);
        this.state = {
            stackItemsHeight: 400, items: [], stackItems: [], ordersMap: {}, position: 1, orders: [],
            volumes: [], activeTrade: null, securityInfo: null
        };
    }

    updateSize = () => {
        this.setState({
            stackItemsHeight: document.querySelector('.td__stack-main').clientHeight
        });
    };

    componentDidMount = (): void => {
        window.addEventListener('resize', this.updateSize);

        this.stackItemsSubscription = WebsocketService.getInstance()
            .on<StackItem[]>(WSEvent.STACK).subscribe(stackItems => {
                this.setState({stackItems});
            });

        this.ordersSetupSubscription = WebsocketService.getInstance()
            .on<Order[]>(WSEvent.ORDERS).subscribe(orders => {
                this.setState({orders});
            });

        this.volumesSubscription = WebsocketService.getInstance()
            .on<SecurityVolume[]>(WSEvent.VOLUMES).subscribe(volumes => {
                this.setState({volumes});
            });

        this.activeTradeSubscription = WebsocketService.getInstance()
            .on<ActiveTrade>(WSEvent.ACTIVE_TRADE).subscribe(activeTrade => {
                this.setState({activeTrade});
            });
    };

    componentWillUnmount = (): void => {
        this.stackItemsSubscription.unsubscribe();
        this.ordersSetupSubscription.unsubscribe();
        this.volumesSubscription.unsubscribe();
        this.activeTradeSubscription.unsubscribe();
        window.removeEventListener('resize', this.updateSize);
    };

    componentWillReceiveProps = (nextProps) => {
        if (nextProps.orders) {
            this.setState({ordersMap: this.ordersMap()});
        }

        if (nextProps.securityLastInfo) {
            const {securityInfo} = this.state;
            if (!securityInfo || nextProps.securityLastInfo.secCode !== securityInfo.secCode) {
                this.setState({
                    securityInfo: getSecurity(nextProps.securityLastInfo.classCode, nextProps.securityLastInfo.secCode)
                });
            }
        }
    };

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<States>, nextContext: any): boolean {
        const {stackItems} = this.state;
        if (stackItems && nextState.stackItems && stackItems.length > 0
            && stackItems.length === nextState.stackItems.length) {
            const index = stackItems.length / 2;
            if (stackItems[index].price === nextState.stackItems[index].price
                && stackItems[index].quantity === nextState.stackItems[index].quantity) {
                return false;
            }
        }

        return true;
    }

    clickOnStackItem = (e: any, val: any) => {
        let mouseBtn = "";
        switch (e.button) {
            case this.MOUSE_BTN_LEFT:
                mouseBtn = "left";
                break;
            case this.MOUSE_BTN_RIGHT:
                mouseBtn = "right";
                const order = this.ordersMap()[val.price];
                if (order) {
                    this.cancelOrder(order);
                } else {
                    this.createOrder(val);
                }
                break;
            case this.MOUSE_BTN_BACKWARD:
                mouseBtn = "backward";
                this.createStopOrder(val);
                break;
            case this.MOUSE_BTN_FORWARD:
                mouseBtn = "forward";
                break;
            case this.MOUSE_BTN_WHEEL:
                mouseBtn = "wheel";
                break;
        }
        console.log("clicked: " + mouseBtn, e, val);
    };

    createStopOrder = (val: any) => {
        const {securityLastInfo} = this.props;
        createStop({
            classCode: securityLastInfo.classCode,
            secCode: securityLastInfo.secCode,
            stop: val.price
        }).catch(reason => {
            console.log('[ERROR](createStopOrder): ' + reason);
        });
    };

    createOrder = (val: any) => {
        const {securityLastInfo, history} = this.props;
        const {position} = this.state;

        const orders: Order[] = [
            {
                price: val.price,
                quantity: position,
                operation: val.price > securityLastInfo.priceLastTrade ? OperationType.SELL : OperationType.BUY,
                type: OrderType.LIMIT,
                classCode: securityLastInfo.classCode,
                secCode: securityLastInfo.secCode
            }
        ];

        // console.log(orders)
        WebsocketService.getInstance().send(history ? WSEvent.HISTORY_CREATE_ORDERS : WSEvent.CREATE_ORDERS, orders);
    };

    cancelOrder = (order: Order) => {
        const {history} = this.props;
        WebsocketService.getInstance().send(history ? WSEvent.HISTORY_CANCEL_ORDERS : WSEvent.CANCEL_ORDERS, [order])
    };

    ordersMap = () => {
        const {orders} = this.state;
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

    createStackViewNew = (): StackItemWrapper[] => {
        const {ordersMap, stackItems, activeTrade, securityInfo} = this.state;

        if (stackItems.length === 0) return [];
        const stackItemMap = {};
        for (const stackItem of stackItems) {
            stackItemMap[stackItem.price] = stackItem;
        }

        const multiplier = 100;
        const step = 0.01 * multiplier;
        const offset = 0.2 * multiplier;
        const stackItemsStartPrice = Math.round(stackItems[0].price * multiplier);
        const stackItemsEndPrice = Math.round(stackItems[stackItems.length - 1].price * multiplier);
        let price = stackItemsStartPrice + offset;
        const endPrice = stackItemsEndPrice - offset;
        const stackItemWrappers: StackItemWrapper[] = [];

        while (price > endPrice) {
            let style = {};
            let value = {
                price: price / multiplier,
                quantity: 0,
                sell: undefined
            };

            if (stackItemMap[value.price]) {
                value = stackItemMap[value.price];
                if (value.sell !== undefined) {
                    style = {backgroundColor: value.sell ? '#e74c3c44' : '#16a08544'};
                }
            }

            let className = "stack-item";
            if (price % 10 === 0) {
                className += " stack-item-10";
            } else if (price % 5 === 0) {
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

            if (activeTrade) {
                if (value.price === activeTrade.avgPrice) {
                    stackItemOrderClassName += " active-order";
                    quantity = activeTrade.quantity;
                }
                if (activeTrade.stopOrder && value.price === activeTrade.stopOrder.price) {
                    stackItemOrderClassName += " stop-order";
                    quantity = activeTrade.stopOrder.quantity;
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
                    sell: value.sell
                }
            });

            price -= step;
        }

        return stackItemWrappers;
    };

    render() {
        const {securityLastInfo} = this.props;
        const {volumes, stackItemsHeight} = this.state;
        const stackItemWrappers = this.createStackViewNew();

        return (
            <div className="td__stack">
                <StackSwitcher onSelectedPosition={(pos) => {
                    this.setState({position: pos})
                }}/>
                <div className="td__stack-main">
                    <StackVolumes volumes={volumes}/>
                    <StopCalc securityLastInfo={securityLastInfo}/>
                    <div className="p-grid stack-items-wrap">
                        <div className="p-col-12 stack-items" style={{height: stackItemsHeight}}>
                            {
                                stackItemWrappers.map(value =>
                                    <StackItemView key={value.price}
                                                   stackItemWrapper={value}
                                                   onItemClick={this.clickOnStackItem}/>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}