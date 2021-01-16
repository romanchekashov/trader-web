import * as React from "react";
import "./Stack.css";
import StackVolumes from "./volumes/StackVolumes";
import {SubscriptionLike} from "rxjs";
import {StackItemView} from "./StackItemView";
import {StackItemWrapper} from "./data/StackItemWrapper";
import {StackSwitcher} from "./StackSwitcher";
import {SecurityLastInfo} from "../../data/security/SecurityLastInfo";
import {Order} from "../../data/Order";
import {SecurityVolume} from "./volumes/data/SecurityVolume";
import {StackItem} from "./data/StackItem";
import {WebsocketService, WSEvent} from "../../api/WebsocketService";
import {OperationType} from "../../data/OperationType";
import {createStop, getActiveOrders, getActiveStopOrders, getActiveTrades} from "../../api/rest/traderRestApi";
import {OrderType} from "../../data/OrderType";
import {ActiveTrade} from "../../data/ActiveTrade";
import {playSound} from "../../assets/assets";
import {StopOrder} from "../../data/StopOrder";
import {getSelectedSecurity} from "../../utils/Cache";
import SessionTradeResultView from "../control-panel/components/SessionTradeResultView";
import ActiveTradeView from "../control-panel/components/ActiveTradeView";
import {SessionTradeResult} from "../../data/SessionTradeResult";
import {Growl} from "primereact/components/growl/Growl";
import {ControlPanelGeneralBtn} from "./control-panel/ControlPanelGeneralBtn";
import {ControlPanelFastBtn} from "./control-panel/ControlPanelFastBtn";
import {TradePremise} from "../../data/strategy/TradePremise";
import {adjustTradePremise} from "../../utils/DataUtils";
import intervalCompare from "../../utils/IntervalComporator";
import DepositView from "./deposit/DepositView";
import {TEST_ACTIVE_TRADES} from "../../utils/TestData";
import {StackEvent, StackService} from "./StackService";

type Props = {};

type States = {
    stackItemsHeight: number
    items: number[]
    stackItems: StackItem[]
    ordersMap: any
    position: number
    orders: Order[]
    stopOrders: StopOrder[]
    volumes: SecurityVolume[]
    activeTrades: ActiveTrade[]
    selectedActiveTrade: ActiveTrade
    sessionResult: SessionTradeResult
    history?: boolean
    securityLastInfo: SecurityLastInfo
    premise: TradePremise,
    selectedSecId: number
}

export class Stack extends React.Component<Props, States> {

    private lastSecuritiesSubscription: SubscriptionLike = null
    private stackItemsSubscription: SubscriptionLike = null
    private ordersSetupSubscription: SubscriptionLike = null
    private volumesSubscription: SubscriptionLike = null
    private activeTradeSubscription: SubscriptionLike = null
    private tradePremiseSubscription: SubscriptionLike = null
    private stackEventsListener: SubscriptionLike = null
    private stopOrdersSubscription: SubscriptionLike = null

    private previousOrdersNumber: number = 0
    private previousStopOrder: StopOrder
    private growl: any

    MOUSE_BTN_LEFT = 0
    MOUSE_BTN_WHEEL = 1
    MOUSE_BTN_RIGHT = 2
    MOUSE_BTN_BACKWARD = 3
    MOUSE_BTN_FORWARD = 4

    constructor(props) {
        super(props)
        this.state = {
            stackItemsHeight: 400,
            items: [],
            stackItems: [],
            ordersMap: {},
            position: 1,
            orders: [],
            stopOrders: [],
            volumes: [],
            activeTrades: [],
            selectedActiveTrade: null,
            sessionResult: null,
            history: false,
            securityLastInfo: null,
            premise: null,
            selectedSecId: null
        }
    }

    updateSize = () => {
        this.setState({
            stackItemsHeight: window.innerHeight
        })
    }

    blockContextMenu = (evt) => {
        evt.preventDefault()
    }

    componentDidMount = (): void => {
        this.updateSize()
        window.addEventListener('resize', this.updateSize)

        document.getElementById("stack-items-wrap-id").addEventListener('contextmenu', this.blockContextMenu)

        this.stackEventsListener = StackService.getInstance()
            .on<SecurityLastInfo>(StackEvent.SECURITY_SELECTED)
            .subscribe(sec => {
                const {activeTrades} = this.state
                if (activeTrades.length > 0) {
                    this.setState({
                        selectedSecId: sec.id,
                        selectedActiveTrade: activeTrades.find(at => at.secId === sec.id)
                    })
                } else {
                    this.setState({selectedSecId: sec.id})
                }

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
            })

        this.lastSecuritiesSubscription = WebsocketService.getInstance()
            .on<SecurityLastInfo[]>(WSEvent.LAST_SECURITIES)
            .subscribe(securities => {
                const {selectedSecId} = this.state
                if (selectedSecId) {
                    const securityLastInfo = securities.find(o => o.id === selectedSecId)
                    if (securityLastInfo) {
                        securityLastInfo.lastTradeTime = new Date(securityLastInfo.lastTradeTime)
                    }
                    this.setState({securityLastInfo})
                }
            })

        this.stackItemsSubscription = WebsocketService.getInstance()
            .on<StackItem[]>(WSEvent.STACK).subscribe(stackItems => {
                this.setState({stackItems})
            })

        getActiveOrders().then(this.updateActiveOrders)
        this.ordersSetupSubscription = WebsocketService.getInstance()
            .on<Order[]>(WSEvent.ORDERS)
            .subscribe(this.updateActiveOrders)

        this.volumesSubscription = WebsocketService.getInstance()
            .on<SecurityVolume[]>(WSEvent.VOLUMES)
            .subscribe(volumes => {
                this.setState({volumes})
            })

        getActiveStopOrders().then(this.updateActiveStopOrders)
        this.stopOrdersSubscription = WebsocketService.getInstance()
            .on<StopOrder[]>(WSEvent.STOP_ORDERS)
            .subscribe(this.updateActiveStopOrders)

        getActiveTrades().then(this.updateActiveTrades)
        this.activeTradeSubscription = WebsocketService.getInstance()
            .on<ActiveTrade[]>(WSEvent.ACTIVE_TRADES)
            .subscribe(this.updateActiveTrades)

        this.tradePremiseSubscription = WebsocketService.getInstance()
            .on<TradePremise>(WSEvent.TRADE_PREMISE)
            .subscribe(premise => {
                if (!premise) adjustTradePremise(premise)
                this.setState({premise})
            })
    }

    componentWillUnmount = (): void => {
        this.lastSecuritiesSubscription.unsubscribe()
        this.stackItemsSubscription.unsubscribe()
        this.ordersSetupSubscription.unsubscribe()
        this.volumesSubscription.unsubscribe()
        this.activeTradeSubscription.unsubscribe()
        this.stackEventsListener.unsubscribe()
        this.stopOrdersSubscription.unsubscribe()
        window.removeEventListener('resize', this.updateSize)
        document.getElementById("stack-items-wrap-id").removeEventListener('contextmenu', this.blockContextMenu)
    }

    updateActiveOrders = (orders: Order[]): void => {
        this.notifyIfOrderHit(orders)
        this.setState({orders, ordersMap: this.ordersMap(orders)})
    }

    updateActiveStopOrders = (newStopOrders: StopOrder[]): void => {
        const {stopOrders} = this.state
        if (stopOrders.length !== newStopOrders.length) {
            this.setState({stopOrders: newStopOrders})
        }
    }

    updateActiveTrades = (activeTrades: ActiveTrade[]): void => {
        const {securityLastInfo} = this.state
        if (activeTrades && activeTrades.length > 0) {
            this.notifyIfStopHit(activeTrades)
            this.setState({
                activeTrades,
                selectedActiveTrade: securityLastInfo ? activeTrades
                    .find(at => at.secId === securityLastInfo.id) : null
            })
        } else {
            this.setState({activeTrades: [], selectedActiveTrade: null})
        }
    }

    notifyIfOrderHit = (orders: Order[]): void => {
        if (orders && orders.length !== this.previousOrdersNumber) {
            playSound(1);
            this.previousOrdersNumber = orders.length;
        }
    };

    notifyIfStopHit = (newActiveTrades: ActiveTrade[]): void => {
        const {activeTrades} = this.state;

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
    }

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
                if (e.ctrlKey) {
                    this.createStopOrder(val);
                } else {
                    const {ordersMap} = this.state;
                    const order = ordersMap[val.price];
                    if (order) {
                        this.cancelOrder(order);
                    } else {
                        this.createOrder(val);
                    }
                }
                break;
        }
        console.log("clicked: " + mouseBtn, e, val);
    };

    createStopOrder = (val: any) => {
        const {securityLastInfo} = this.state;
        createStop({
            classCode: securityLastInfo.classCode,
            secCode: securityLastInfo.secCode,
            stop: val.price
        }).catch(reason => {
            console.log('[ERROR](createStopOrder): ' + reason);
        });
    };

    createOrder = (val: any) => {
        const {position, securityLastInfo, history} = this.state;

        const orders: Order[] = [
            {
                secId: securityLastInfo.id,
                price: val.price,
                quantity: position,
                operation: val.price > securityLastInfo.lastTradePrice ? OperationType.SELL : OperationType.BUY,
                type: OrderType.LIMIT,
                classCode: securityLastInfo.classCode,
                secCode: securityLastInfo.secCode
            }
        ];

        // console.log(orders)
        WebsocketService.getInstance().send(history ? WSEvent.HISTORY_CREATE_ORDERS : WSEvent.CREATE_ORDERS, orders);
    };

    cancelOrder = (order: Order) => {
        const {history} = this.state;
        WebsocketService.getInstance().send(history ? WSEvent.HISTORY_CANCEL_ORDERS : WSEvent.CANCEL_ORDERS, [order])
    };

    ordersMap = (orders: Order[]): any => {
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
        const {ordersMap, stackItems, activeTrades, selectedActiveTrade, securityLastInfo} = this.state

        if (stackItems.length === 0 || !securityLastInfo) return []
        const stackItemMap = {}
        for (const stackItem of stackItems) {
            stackItemMap[stackItem.price] = stackItem
        }

        const multiplier = Math.pow(10, securityLastInfo.scale);
        const step = securityLastInfo.secPriceStep * multiplier;
        const offset = 20 * step;
        const stackItemsStartPrice = Math.round(stackItems[0].price * multiplier);
        const stackItemsEndPrice = Math.round(stackItems[stackItems.length - 1].price * multiplier);
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
                sell: undefined
            };

            if (stackItemMap[value.price]) {
                value = stackItemMap[value.price];
                if (value.sell !== undefined) {
                    style = {backgroundColor: value.sell ? '#e74c3c44' : '#16a08544'};
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
                if (selectedActiveTrade.stopOrder && value.price === selectedActiveTrade.stopOrder.price) {
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
                    sell: value.sell
                }
            });

            price -= step;
        }

        return this.fillWithPremise(stackItemWrappers)
    }

    fillWithPremise = (items: StackItemWrapper[]): StackItemWrapper[] => {
        const {premise} = this.state

        if (premise) {
            const srMap = {}
            premise.analysis.srLevels.forEach(value => {
                if (!srMap[value.swingHL] || intervalCompare(value.interval, srMap[value.swingHL]) > 0) {
                    srMap[value.swingHL] = value.interval
                }
            })
            items.forEach(value => value.srInterval = srMap[value.price])
        }
        return items
    }

    onSelectActiveTrade = (selectedActiveTrade: ActiveTrade): void => {
        this.setState({selectedActiveTrade})
        StackService.getInstance().send(StackEvent.ACTIVE_TRADE_SELECTED, selectedActiveTrade)
    }

    render() {
        const {
            volumes, stackItemsHeight, sessionResult, activeTrades,
            selectedActiveTrade, securityLastInfo
        } = this.state
        const stackItemWrappers = this.createStackViewNew()

        return (
            <>
                <StackSwitcher onSelectedPosition={(pos) => {
                    this.setState({position: pos})
                }}/>
                <div className="td__stack-main">
                    <div className="p-grid control-panel">
                        <Growl ref={(el) => this.growl = el}/>
                        <div className="p-col-12" style={{padding: 0, fontSize: '12px'}}>
                            <SessionTradeResultView result={sessionResult}/>
                            <ActiveTradeView trades={activeTrades}
                                             selected={selectedActiveTrade}
                                             onSelectRow={this.onSelectActiveTrade}/>
                            <DepositView/>
                        </div>
                        <div className="p-col-12">
                            <ControlPanelGeneralBtn growl={this.growl}
                                                    history={false}
                                                    security={securityLastInfo}/>
                        </div>
                        <div className="p-col-12">
                            <ControlPanelFastBtn growl={this.growl}
                                                 history={false}
                                                 activeTrade={selectedActiveTrade}/>
                        </div>
                        <div className="p-col-12">
                            <StackVolumes volumes={volumes}/>
                        </div>
                    </div>
                    <div id="stack-items-wrap-id" className="p-grid stack-items-wrap">
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
            </>
        )
    }
}