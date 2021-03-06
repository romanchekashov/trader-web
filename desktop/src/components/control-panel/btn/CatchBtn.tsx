import * as React from "react";
import {Button} from "primereact/components/button/Button";
import {OperationType} from "../../../common/data/OperationType";
import {Order} from "../../../common/data/Order";
import {OrderType} from "../../../common/data/OrderType";
import {SecurityLastInfo} from "../../../common/data/SecurityLastInfo";
import {SelectButton} from "primereact/components/selectbutton/SelectButton";
import {WebsocketService, WSEvent} from "../../../common/api/WebsocketService";
import {round100} from "../../../common/utils/utils";

type Props = {
    growl: any
    history?: boolean
    security: SecurityLastInfo
    isMarket: boolean
};

type States = {
    sellPrice: number
    buyPrice: number
    price: number
    quantity: number
    steps: number
    multiplier: number
    isMarket: boolean
};

export class CatchBtn extends React.Component<Props, States> {

    quantitySets = [
        {label: '1', value: 1},
        {label: '2', value: 2},
        {label: '4', value: 4},
        {label: '5', value: 5},
        {label: '10', value: 10},
        {label: '15', value: 15},
        {label: '20', value: 20},
        {label: '25', value: 25}
    ];

    constructor(props) {
        super(props);
        this.state = {price: 0, sellPrice: 0, buyPrice: 0, quantity: 1, steps: 2, multiplier: 1, isMarket: false};
    }

    prices = (isSell: boolean) => {
        const {security} = this.props;
        if (!security) return [];

        const lastPrice = security.priceLastTrade;
        if (isSell) {
            return [
                lastPrice,
                lastPrice + 0.05,
                lastPrice + 0.1,
                lastPrice + 0.15,
                lastPrice + 0.2,
                lastPrice + 0.25,
                lastPrice + 0.3
            ].map(price => {
                price = round100(price);
                return {label: price, value: price};
            });
        } else {
            return [
                lastPrice,
                lastPrice - 0.05,
                lastPrice - 0.1,
                lastPrice - 0.15,
                lastPrice - 0.2,
                lastPrice - 0.25,
                lastPrice - 0.3
            ].map(price => {
                price = round100(price);
                return {label: price, value: price};
            });
        }
    };

    createOrder = (operation: OperationType) => {
        const {security, history, growl, isMarket} = this.props;
        const {quantity, steps, multiplier} = this.state;

        const price = security.priceLastTrade;

        const orders: Order[] = [
            {
                price,
                quantity,
                operation,
                type: isMarket ? OrderType.MARKET : OrderType.LIMIT,
                classCode: security.classCode,
                secCode: security.secCode
            }
        ];

        if (operation === OperationType.BUY && price > security.priceLastTrade) {
            growl.show({severity: 'error', summary: 'Error Message', detail: 'Cannot buy greater then current price!'});
            return;
        }
        if (operation === OperationType.SELL && price < security.priceLastTrade) {
            growl.show({severity: 'error', summary: 'Error Message',
                detail: 'Cannot sell chipper then current price!'});
            return;
        }
        // console.log(orders)
        WebsocketService.getInstance().send(history ? WSEvent.HISTORY_CREATE_ORDERS : WSEvent.CREATE_ORDERS, orders);
    };

    render() {
        const {price, quantity} = this.state;

        return (
            <div className="p-grid">
                <div className="p-col-12">
                    <SelectButton value={quantity}
                                  options={this.quantitySets}
                                  onChange={(e) => this.setState({quantity: e.value})} />
                </div>

                {/*<div className="p-col-12">
                    <SelectButton value={sellPrice}
                                  options={this.prices(true)}
                                  onChange={(e) => this.setState({sellPrice: e.value, price: e.value})} />
                </div>
                <div className="p-col-12">
                    <SelectButton value={buyPrice}
                                  options={this.prices(false)}
                                  onChange={(e) => this.setState({buyPrice: e.value, price: e.value})} />
                </div>*/}

                <div className="p-col-12">
                    <div className="p-grid">
                        <div className="p-col-3">
                            <Button label="Buy" className="p-button-success" style={{width: '100%'}}
                                    onClick={() => {
                                        this.createOrder(OperationType.BUY);
                                    }}/>
                        </div>
                        <div className="p-col-3">
                            <Button label="Sell" className="p-button-danger" style={{width: '100%'}}
                                    onClick={() => {
                                        this.createOrder(OperationType.SELL);
                                    }}/>
                        </div>
                        <div className="p-col-3">
                            Price: {price}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}