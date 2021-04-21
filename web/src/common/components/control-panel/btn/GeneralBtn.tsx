import * as React from "react";
import {Button} from "primereact/components/button/Button";
import {InputText} from "primereact/components/inputtext/InputText";
import {Dropdown} from "primereact/components/dropdown/Dropdown";
import {SecurityLastInfo} from "../../../data/security/SecurityLastInfo";
import {PrimeDropdownItem, round100} from "../../../utils/utils";
import {OperationType} from "../../../data/OperationType";
import {Order} from "../../../data/Order";
import {OrderType} from "../../../data/OrderType";
import {WebsocketService, WSEvent} from "../../../api/WebsocketService";
import {ClassCode} from "../../../data/ClassCode";

type Props = {
    security: SecurityLastInfo
    history?: boolean
    growl: any
};

type States = {
    price: number
    quantity: number
    steps: number
    multiplier: number
    btnSet: string
    isMarket: boolean
};

export class GeneralBtn extends React.Component<Props, States> {

    private multipliers: PrimeDropdownItem<number>[] = [1, 2, 4, 8].map(val => ({label: "" + val, value: val}));

    constructor(props) {
        super(props);
        this.state = {price: 0, quantity: 1, steps: 2, multiplier: 1, btnSet: 'general', isMarket: false};
    }

    quantityChangeByKeydown = (e) => {
        let {quantity} = this.state;

        if (e.key === 'ArrowUp') {
            quantity++;
        } else if (e.key === 'ArrowDown' && quantity > 1) {
            quantity--;
        }

        this.setState({quantity});
    };

    priceChangeByKeydown = (e) => {
        let {price} = this.state;

        if (e.key === 'ArrowUp') {
            price += 0.01;
        } else if (e.key === 'ArrowDown' && price > 0) {
            price -= 0.01;
        }

        price = round100(price);

        this.setState({price});
    };

    componentDidMount = (): void => {
        document.getElementById('td__control-panel-price')
            .addEventListener('keydown', this.priceChangeByKeydown);
    };

    componentWillUnmount = (): void => {
        document.getElementById('td__control-panel-price')
            .removeEventListener('keydown', this.priceChangeByKeydown);
    };

    createOrder = (operation: OperationType) => {
        const {security, history, growl} = this.props;
        const {price, quantity, steps, multiplier} = this.state;

        const orders: Order[] = [
            {
                secId: security.id,
                price,
                quantity,
                operation,
                type: OrderType.LIMIT,
                classCode: security.classCode,
                secCode: security.secCode
            }
        ];

        if (operation === OperationType.BUY && price > security.lastTradePrice) {
            growl.show({severity: 'error', summary: 'Error Message', detail: 'Cannot buy greater then current price!'});
            return;
        }
        if (operation === OperationType.SELL && price < security.lastTradePrice) {
            growl.show({
                severity: 'error', summary: 'Error Message',
                detail: 'Cannot sell chipper then current price!'
            });
            return;
        }
        // console.log(orders)
        WebsocketService.getInstance().send(history ? WSEvent.HISTORY_CREATE_ORDERS : WSEvent.CREATE_ORDERS, orders);
    };

    changeOrder = () => {
        const {history} = this.props;

        WebsocketService.getInstance().send(history ? WSEvent.HISTORY_CHANGE_ORDERS : WSEvent.CHANGE_ORDERS)
    };

    cancelOrder = () => {
        const {history} = this.props;

        WebsocketService.getInstance().send(history ? WSEvent.HISTORY_CANCEL_ORDERS : WSEvent.CANCEL_ORDERS)
    };

    render() {
        const {price, quantity, steps, multiplier, btnSet, isMarket} = this.state;

        return (
            <div className="p-grid">
                <div className="p-col-2">
                    <Button label="Buy" className="p-button-success"
                            style={{width: '100%', paddingTop: 4, paddingBottom: 4}}
                            onClick={() => {
                                this.createOrder(OperationType.BUY);
                            }}/>
                </div>
                <div className="p-col-2" style={{padding: '0.5em 0'}}>
                    <span className="p-float-label">
                                <InputText id="td__control-panel-price"
                                           style={{width: '100px'}}
                                           value={price}
                                           onChange={(e) => this.setState({price: e.target['value']})}/>
                                <label htmlFor="td__control-panel-price">Price</label>
                            </span>
                </div>
                <div className="p-col-2">
                            <span className="p-float-label">
                                <InputText id="td__control-panel-quantity"
                                           style={{width: '100px'}}
                                           value={quantity}
                                           onKeyDown={this.quantityChangeByKeydown}
                                           onChange={(e) => this.setState({quantity: e.target['value']})}/>
                                <label htmlFor="td__control-panel-quantity">Quantity</label>
                            </span>
                </div>
                <div className="p-col-2">
                            <span className="p-float-label">
                                <InputText id="steps"
                                           style={{width: '100px'}}
                                           value={steps}
                                           onChange={(e) => this.setState({steps: e.target['value']})}/>
                                <label htmlFor="steps">Steps</label>
                            </span>
                </div>
                <div className="p-col-2">
                    <Dropdown value={multiplier}
                              options={this.multipliers}
                              onChange={(e) => {
                                  this.setState({multiplier: e.value})
                              }}
                              style={{width: '100px'}}
                              placeholder="Select a multiplier"/>
                </div>
                <div className="p-col-2">
                    <Button label="Sell" className="p-button-danger"
                            style={{width: '100%', paddingTop: 4, paddingBottom: 4}}
                            onClick={() => {
                                this.createOrder(OperationType.SELL);
                            }}/>
                </div>
            </div>
        )
    }
}