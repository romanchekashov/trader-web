import * as React from "react";
import {Button} from "primereact/components/button/Button";
import {Dialog} from "primereact/components/dialog/Dialog";
import {ActiveTrade} from "../../../data/ActiveTrade";
import {WebsocketService, WSEvent} from "../../../api/WebsocketService";

type Props = {
    growl: any
    activeTrade: ActiveTrade
    history?: boolean
};

type States = {
    terminatePositionDialogVisible: boolean
    reversePositionDialogVisible: boolean
};

export class FastBtn extends React.Component<Props, States> {

    constructor(props) {
        super(props);
        this.state = {terminatePositionDialogVisible: false, reversePositionDialogVisible: false};
    }

    cancelActiveOrders = () => {
        const {history} = this.props;

        WebsocketService.getInstance().send(history ? WSEvent.HISTORY_CANCEL_ORDERS : WSEvent.CANCEL_ORDERS)
    };

    cancelStopOrders = () => {
        const {history} = this.props;
        WebsocketService.getInstance().send(history ? WSEvent.HISTORY_CANCEL_STOP_ORDERS : WSEvent.CANCEL_STOP_ORDERS)
    };

    terminatePosition = () => {
        const {history, activeTrade, growl} = this.props;
        if (!activeTrade) {
            growl.show({severity: 'error', summary: 'Error Message', detail: 'No any active trades!'});
            return;
        }

        WebsocketService.getInstance().send(history ? WSEvent.HISTORY_TERMINATE_POSITION : WSEvent.TERMINATE_POSITION);
    };

    reversePosition = () => {
        const {history, activeTrade, growl} = this.props;
        if (!activeTrade) {
            growl.show({severity: 'error', summary: 'Error Message', detail: 'No any active trades!'});
            return;
        }

        WebsocketService.getInstance().send(history ? WSEvent.HISTORY_REVERSE_POSITION : WSEvent.REVERSE_POSITION);
    };

    renderTerminatePositionDialogFooter = () => {
        return (
            <div>
                <Button label="Yes" icon="pi pi-check"
                        onClick={(e) => {
                            this.setState({terminatePositionDialogVisible: false});
                            this.terminatePosition();
                        }}/>
                <Button label="No" icon="pi pi-times"
                        onClick={() => this.setState({terminatePositionDialogVisible: false})}
                        className="p-button-secondary"/>
            </div>
        );
    };

    renderReversePositionDialogFooter = () => {
        return (
            <div>
                <Button label="Yes" icon="pi pi-check"
                        onClick={(e) => {
                            this.setState({reversePositionDialogVisible: false});
                            this.reversePosition();
                        }}/>
                <Button label="No" icon="pi pi-times"
                        onClick={() => this.setState({reversePositionDialogVisible: false})}
                        className="p-button-secondary"/>
            </div>
        );
    };

    render() {
        const {terminatePositionDialogVisible, reversePositionDialogVisible} = this.state;

        return (
            <div className="p-grid">
                <div className="p-col-2">
                    <Button label="Cancel Active Orders" style={{width: '100%'}}
                            onClick={this.cancelActiveOrders}/>
                </div>
                <div className="p-col-2">
                    <Button label="Terminate Position" style={{width: '100%'}}
                            className="p-button-danger"
                            onClick={() => this.setState({terminatePositionDialogVisible: true})}/>
                    <Dialog header="Terminate Position" visible={terminatePositionDialogVisible}
                            style={{width: '50vw'}} position="top"
                            onHide={() => this.setState({terminatePositionDialogVisible: false})}
                            footer={this.renderTerminatePositionDialogFooter()}>
                        <p>Are you sure to Terminate Position on Market price?</p>
                    </Dialog>
                </div>
                <div className="p-col-2">
                    <Button label="Reverse Position" className="p-button-warning" style={{width: '100%'}}
                            onClick={() => this.setState({reversePositionDialogVisible: true})}/>
                    <Dialog header="Reverse Position" visible={reversePositionDialogVisible}
                            style={{width: '50vw'}} position="top"
                            onHide={() => this.setState({reversePositionDialogVisible: false})}
                            footer={this.renderReversePositionDialogFooter()}>
                        <p>Are you sure to Reverse Position on Market price?</p>
                    </Dialog>
                </div>
                <div className="p-col-2">
                    <Button label="Cancel Stop Orders" style={{width: '100%'}}
                            onClick={this.cancelStopOrders}/>
                </div>
            </div>
        )
    }
}