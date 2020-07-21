import * as React from "react";
import {Button} from "primereact/button";
import {Dialog} from "primereact/dialog";
import {InputText} from "primereact/components/inputtext/InputText";
import {Security} from "../../../data/Security";
import {round} from "../../../utils/utils";
import {SelectButton} from "primereact/components/selectbutton/SelectButton";
import {Order} from "../../../data/Order";
import {OrderType} from "../../../data/OrderType";
import {OperationType} from "../../../data/OperationType";

type Props = {
    securityInfo: Security
    showModal: boolean
    alert: any
    chartId: any
    onClose: () => void
    onSave: (alert: any, chartId: any, order: Order) => void
    onDeleteAlert: () => void
}

type State = {
    alert: any
    btnSet: string
    quantity: number
    order: Order
}

export class ChartDialog extends React.Component<Props, State> {

    btnSets = [
        {label: 'Stop', value: 'stop'},
        {label: 'Buy', value: 'buy'},
        {label: 'Sell', value: 'sell'}
    ]

    quantitySets = [
        {label: '1', value: 1},
        {label: '2', value: 2},
        {label: '4', value: 4},
        {label: '5', value: 5},
        {label: '10', value: 10},
        {label: '15', value: 15},
        {label: '20', value: 20},
        {label: '25', value: 25}
    ]

    constructor(props) {
        super(props);
        this.state = {
            alert: props.alert, btnSet: 'stop', quantity: 1, order: null
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSave = this.handleSave.bind(this);
    }

    componentWillReceiveProps = (nextProps) => {
        const {showModal, securityInfo} = this.props;
        if (nextProps.alert && showModal != nextProps.showModal) {
            nextProps.alert.yValue = round(nextProps.alert.yValue, securityInfo.scale)
            this.setState({
                alert: nextProps.alert,
            });
        }
    }

    handleChange = (e) => {
        const {alert} = this.state;
        this.setState({
            alert: {
                ...alert,
                yValue: Number(e.target.value),
            }
        });
    }

    handleSave = () => {
        const {chartId, securityInfo} = this.props
        const {alert, quantity, btnSet} = this.state

        const operation = btnSet === 'buy' ? OperationType.BUY
            : btnSet === 'sell' ? OperationType.SELL : null

        this.props.onSave(alert, chartId, {
            price: alert.yValue,
            quantity,
            operation,
            type: OrderType.LIMIT,
            classCode: securityInfo.classCode,
            secCode: securityInfo.secCode
        });
    }

    onEnterPressed = (e) => {
        if (e.key === 'Enter') {
            this.handleSave()
        }
    }

    footer = (
        <div>
            <Button label="Delete Alert" icon="pi pi-check" onClick={this.props.onDeleteAlert}/>
            <Button label="Save" icon="pi pi-times" onClick={this.handleSave}/>
        </div>
    )

    render() {
        const {
            showModal,
            onClose,
            securityInfo
        } = this.props;
        const {alert, btnSet, quantity} = this.state;

        if (!showModal) return null;

        return (
            <Dialog header="Edit Alert"
                    footer={this.footer}
                    visible={showModal}
                    style={{width: '50vw'}}
                    modal={true}
                    onHide={onClose}>
                <div className="p-grid">
                    <div className="p-col-12">
                        <SelectButton value={btnSet}
                                      options={this.btnSets}
                                      onChange={(e) => this.setState({btnSet: e.value})}/>
                    </div>
                    <div className="p-col-12">
                        <SelectButton value={quantity}
                                      options={this.quantitySets}
                                      onChange={(e) => this.setState({quantity: e.value})}/>
                    </div>
                    <div className="p-col-12">
                        <label htmlFor="chart-dialog-alert-price">Alert when crossing:</label>
                        <InputText id="chart-dialog-alert-price"
                                   type="number"
                                   step={securityInfo.secPriceStep}
                                   value={alert.yValue}
                                   onKeyDown={this.onEnterPressed}
                                   onChange={this.handleChange}/>
                    </div>
                </div>
            </Dialog>
        );
    }
}