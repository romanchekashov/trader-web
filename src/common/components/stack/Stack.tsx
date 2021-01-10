import * as React from "react";
import "./Stack.css";
import StackVolumes from "./volumes/StackVolumes";
import { SubscriptionLike } from "rxjs";
import { StackItemView } from "./StackItemView";
import { StackItemWrapper } from "./data/StackItemWrapper";
import { StackSwitcher } from "./StackSwitcher";
import { SecurityLastInfo } from "../../data/security/SecurityLastInfo";
import { Order } from "../../data/Order";
import { SecurityVolume } from "./volumes/data/SecurityVolume";
import { StackItem } from "./data/StackItem";
import { WebsocketService, WSEvent } from "../../api/WebsocketService";
import { OperationType } from "../../data/OperationType";
import { createStop } from "../../api/rest/traderRestApi";
import { OrderType } from "../../data/OrderType";
import { ActiveTrade } from "../../data/ActiveTrade";
import { playSound } from "../../assets/assets";
import { StopOrder } from "../../data/StopOrder";
import { getSelectedSecurity } from "../../utils/Cache";
import { ToggleButton } from "primereact/togglebutton";
import SessionTradeResultView from "../control-panel/components/SessionTradeResultView";
import ActiveTradeView from "../control-panel/components/ActiveTradeView";
import { SessionTradeResult } from "../../data/SessionTradeResult";
import { Growl } from "primereact/components/growl/Growl";
import { ControlPanelGeneralBtn } from "./control-panel/ControlPanelGeneralBtn";
import { ControlPanelFastBtn } from "./control-panel/ControlPanelFastBtn";
import { TradePremise } from "../../data/strategy/TradePremise";
import { adjustTradePremise } from "../../utils/DataUtils";
import intervalCompare from "../../utils/IntervalComporator";
import DepositView from "./deposit/DepositView";
import { TEST_ACTIVE_TRADES } from "../../utils/TestData";
import { StackEvent, StackService } from "./StackService";

type Props = {};

type States = {
    stackItemsHeight: number
    items: number[]
    stackItems: StackItem[]
    ordersMap: any
    position: number
    orders: Order[]
    volumes: SecurityVolume[]
    activeTrades: ActiveTrade[]
    selectedActiveTrade: ActiveTrade
    sessionResult: SessionTradeResult
    history?: boolean
    securityLastInfo: SecurityLastInfo
    visible: string
    premise: TradePremise
}

export class Stack extends React.Component<Props, States> {

    private lastSecuritiesSubscription: SubscriptionLike = null
    private stackItemsSubscription: SubscriptionLike = null
    private ordersSetupSubscription: SubscriptionLike = null
    private volumesSubscription: SubscriptionLike = null
    private activeTradeSubscription: SubscriptionLike = null
    private tradePremiseSubscription: SubscriptionLike = null

    private previousOrdersNumber: number = 0
    private previousStopOrder: StopOrder
    private growl: any

    MOUSE_BTN_LEFT = 0
    MOUSE_BTN_WHEEL = 1
    MOUSE_BTN_RIGHT = 2
    MOUSE_BTN_BACKWARD = 3
    MOUSE_BTN_FORWARD = 4

    private VisibleType = {
        HIDE: 'HIDE',
        VISIBLE: 'VISIBLE',
        VISIBLE_PART: 'VISIBLE_PART'
    }

    private ToggleVisibleType = {
        HIDE: -46,
        VISIBLE: -45,
        VISIBLE_PART: -47
    }

    private VisibleTypeViewTop = {
        HIDE: -460,
        VISIBLE: 0,
        VISIBLE_PART: -100
    }

    constructor(props) {
        super(props)
        this.state = {
            stackItemsHeight: 400,
            items: [],
            stackItems: [],
            ordersMap: {},
            position: 1,
            orders: [],
            volumes: [],
            activeTrades: [],
            selectedActiveTrade: null,
            sessionResult: null,
            history: false,
            securityLastInfo: null,
            visible: this.VisibleType.HIDE,
            premise: null
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

        this.lastSecuritiesSubscription = WebsocketService.getInstance()
            .on<SecurityLastInfo[]>(WSEvent.LAST_SECURITIES)
            .subscribe(securities => {
                const selectedSecurity = getSelectedSecurity()
                let secCode = selectedSecurity ? selectedSecurity.secCode : null
                if (secCode) {
                    const securityLastInfo = securities.find(o => o.secCode === secCode)
                    if (securityLastInfo) {
                        securityLastInfo.lastTradeTime = new Date(securityLastInfo.lastTradeTime)
                    }
                    this.setState({ securityLastInfo })
                }
            })

        this.stackItemsSubscription = WebsocketService.getInstance()
            .on<StackItem[]>(WSEvent.STACK).subscribe(stackItems => {
                this.setState({ stackItems })
            })

        this.ordersSetupSubscription = WebsocketService.getInstance()
            .on<Order[]>(WSEvent.ORDERS).subscribe(orders => {
                this.notifyIfOrderHit(orders)
                this.setState({ orders, ordersMap: this.ordersMap(orders) })
            })

        this.volumesSubscription = WebsocketService.getInstance()
            .on<SecurityVolume[]>(WSEvent.VOLUMES).subscribe(volumes => {
                this.setState({ volumes })
            })

        this.activeTradeSubscription = WebsocketService.getInstance()
            .on<ActiveTrade[]>(WSEvent.ACTIVE_TRADES).subscribe(activeTrades => {
                const { securityLastInfo } = this.state
                if (activeTrades && activeTrades.length > 0) {
                    this.notifyIfStopHit(activeTrades)
                    this.setState({
                        activeTrades,
                        selectedActiveTrade: securityLastInfo ? activeTrades
                            .find(at => at.secId === securityLastInfo.id) : null
                    })
                } else {
                    this.setState({ activeTrades: [], selectedActiveTrade: null })
                }
            })

        // TestData
        this.setState({ activeTrades: TEST_ACTIVE_TRADES, selectedActiveTrade: TEST_ACTIVE_TRADES[0] })

        this.tradePremiseSubscription = WebsocketService.getInstance()
            .on<TradePremise>(WSEvent.TRADE_PREMISE)
            .subscribe(premise => {
                if (!premise) adjustTradePremise(premise)
                this.setState({ premise })
            })
    }

    componentWillUnmount = (): void => {
        this.lastSecuritiesSubscription.unsubscribe()
        this.stackItemsSubscription.unsubscribe()
        this.ordersSetupSubscription.unsubscribe()
        this.volumesSubscription.unsubscribe()
        this.activeTradeSubscription.unsubscribe()
        window.removeEventListener('resize', this.updateSize)
        document.getElementById("stack-items-wrap-id").removeEventListener('contextmenu', this.blockContextMenu)
    }

    notifyIfOrderHit = (orders: Order[]): void => {
        if (orders && orders.length !== this.previousOrdersNumber) {
            playSound(1);
            this.previousOrdersNumber = orders.length;
        }
    };

    notifyIfStopHit = (newActiveTrades: ActiveTrade[]): void => {
        const { activeTrades } = this.state;

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
        const { stackItems } = this.state;
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
                    const { ordersMap } = this.state;
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
        const { securityLastInfo } = this.state;
        createStop({
            classCode: securityLastInfo.classCode,
            secCode: securityLastInfo.secCode,
            stop: val.price
        }).catch(reason => {
            console.log('[ERROR](createStopOrder): ' + reason);
        });
    };

    createOrder = (val: any) => {
        const { position, securityLastInfo, history } = this.state;

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
        const { history } = this.state;
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
        const { ordersMap, stackItems, activeTrades, selectedActiveTrade, securityLastInfo } = this.state

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
                    style = { backgroundColor: value.sell ? '#e74c3c44' : '#16a08544' };
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
        const { premise } = this.state

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

    toggleView = (toggle: boolean) => {
        this.setState({
            visible: !toggle ? this.VisibleType.VISIBLE : this.VisibleType.HIDE,
            // securityLastInfo: getSelectedSecurity(),
            // stackItems: [
            //     {
            //         price: getSelectedSecurity().lastTradePrice,
            //         quantity: 1,
            //         sell: true
            //     }, {
            //         price: getSelectedSecurity().lastTradePrice - getSelectedSecurity().secPriceStep,
            //         quantity: 1,
            //         sell: false
            //     }
            // ]
        })
    }

    toggleViewPart = (toggle: boolean) => {
        this.setState({
            visible: !toggle ? this.VisibleType.VISIBLE_PART : this.VisibleType.HIDE
        })
    }

    onSelectActiveTrade = (selectedActiveTrade: ActiveTrade): void => {
        this.setState({ selectedActiveTrade })
        StackService.getInstance().send(StackEvent.ACTIVE_TRADE_SELECTED, selectedActiveTrade)
    }

    render() {
        const {
            volumes, stackItemsHeight, visible, sessionResult, activeTrades,
            selectedActiveTrade, securityLastInfo
        } = this.state
        const stackItemWrappers = this.createStackViewNew()

        return (
            <div id="stack" className="td__stack" style={{ right: this.VisibleTypeViewTop[visible] }}>
                <StackSwitcher onSelectedPosition={(pos) => {
                    this.setState({ position: pos })
                }} />
                <div className="td__stack-main">
                    {
                        visible !== this.VisibleType.VISIBLE_PART ?
                            <div className="p-grid control-panel">
                                <Growl ref={(el) => this.growl = el} />
                                <div className="p-col-12" style={{ padding: 0, fontSize: '12px' }}>
                                    <SessionTradeResultView result={sessionResult} />
                                    <ActiveTradeView trades={activeTrades}
                                        selected={selectedActiveTrade}
                                        onSelectRow={this.onSelectActiveTrade} />
                                    <DepositView />
                                </div>
                                <div className="p-col-12">
                                    <ControlPanelGeneralBtn growl={this.growl}
                                        history={false}
                                        security={securityLastInfo} />
                                </div>
                                <div className="p-col-12">
                                    <ControlPanelFastBtn growl={this.growl}
                                        history={false}
                                        activeTrade={selectedActiveTrade} />
                                </div>
                                <div className="p-col-12">
                                    <StackVolumes volumes={volumes} />
                                </div>
                            </div>
                            : null
                    }
                    <div id="stack-items-wrap-id" className="p-grid stack-items-wrap">
                        <div className="p-col-12 stack-items" style={{ height: stackItemsHeight }}>
                            {
                                stackItemWrappers.map(value =>
                                    <StackItemView key={value.price}
                                        stackItemWrapper={value}
                                        onItemClick={this.clickOnStackItem} />
                                )
                            }
                        </div>
                    </div>
                </div>
                <ToggleButton id="stack-toggle-btn"
                    checked={visible !== this.VisibleType.VISIBLE}
                    onChange={(e) => this.toggleView(e.value)}
                    style={{ left: this.ToggleVisibleType[visible] }}
                    onLabel="Show stack"
                    offLabel="Hide stack" />
                <ToggleButton id="stack-toggle-btn-2"
                    checked={visible !== this.VisibleType.VISIBLE_PART}
                    onChange={(e) => this.toggleViewPart(e.value)}
                    style={{ left: this.ToggleVisibleType[visible] + 4 }}
                    onLabel="Show part"
                    offLabel="Hide part" />
            </div>
        )
    }
}