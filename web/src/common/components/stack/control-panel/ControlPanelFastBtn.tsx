import * as React from "react";
import { ActiveTrade } from "../../../data/ActiveTrade";
import { WebsocketService, WSEvent } from "../../../api/WebsocketService";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

type Props = {
  growl: any;
  activeTrade: ActiveTrade;
  history?: boolean;
};

type States = {
  terminatePositionDialogVisible: boolean;
  reversePositionDialogVisible: boolean;
};

export class ControlPanelFastBtn extends React.Component<Props, States> {
  constructor(props) {
    super(props);
    this.state = {
      terminatePositionDialogVisible: false,
      reversePositionDialogVisible: false,
    };
  }

  cancelActiveOrders = () => {
    const { history } = this.props;

    WebsocketService.getInstance().send(
      history ? WSEvent.HISTORY_CANCEL_ORDERS : WSEvent.CANCEL_ORDERS
    );
  };

  cancelStopOrders = () => {
    const { history } = this.props;
    WebsocketService.getInstance().send(
      history ? WSEvent.HISTORY_CANCEL_STOP_ORDERS : WSEvent.CANCEL_STOP_ORDERS
    );
  };

  terminatePosition = () => {
    const { history, activeTrade, growl } = this.props;
    if (!activeTrade) {
      growl.show({
        severity: "error",
        summary: "Error Message",
        detail: "No any active trades!",
      });
      return;
    }

    WebsocketService.getInstance().send(
      history ? WSEvent.HISTORY_TERMINATE_POSITION : WSEvent.TERMINATE_POSITION
    );
  };

  reversePosition = () => {
    const { history, activeTrade, growl } = this.props;
    if (!activeTrade) {
      growl.show({
        severity: "error",
        summary: "Error Message",
        detail: "No any active trades!",
      });
      return;
    }

    WebsocketService.getInstance().send(
      history ? WSEvent.HISTORY_REVERSE_POSITION : WSEvent.REVERSE_POSITION
    );
  };

  renderTerminatePositionDialogFooter = () => {
    return (
      <div>
        <Button
          label="Yes"
          icon="pi pi-check"
          onClick={(e) => {
            this.setState({ terminatePositionDialogVisible: false });
            this.terminatePosition();
          }}
        />
        <Button
          label="No"
          icon="pi pi-times"
          onClick={() =>
            this.setState({ terminatePositionDialogVisible: false })
          }
          className="p-button-secondary"
        />
      </div>
    );
  };

  renderReversePositionDialogFooter = () => {
    return (
      <div>
        <Button
          label="Yes"
          icon="pi pi-check"
          onClick={(e) => {
            this.setState({ reversePositionDialogVisible: false });
            this.reversePosition();
          }}
        />
        <Button
          label="No"
          icon="pi pi-times"
          onClick={() => this.setState({ reversePositionDialogVisible: false })}
          className="p-button-secondary"
        />
      </div>
    );
  };

  render() {
    const {
      terminatePositionDialogVisible,
      reversePositionDialogVisible,
    } = this.state;

    return (
      <div className="p-grid fast-btn">
        <div className="p-col-3">
          <Button
            label="Cancel Active Orders"
            style={{ width: "100%", height: "100%" }}
            onClick={this.cancelActiveOrders}
          />
        </div>
        <div className="p-col-3">
          <Button
            label="Terminate Position"
            style={{ width: "100%", height: "100%" }}
            className="p-button-danger"
            onClick={() =>
              this.setState({ terminatePositionDialogVisible: true })
            }
          />
          <Dialog
            header="Terminate Position"
            visible={terminatePositionDialogVisible}
            style={{ width: "50vw" }}
            position="top"
            onHide={() =>
              this.setState({ terminatePositionDialogVisible: false })
            }
            footer={this.renderTerminatePositionDialogFooter()}
          >
            <p>Are you sure to Terminate Position on Market price?</p>
          </Dialog>
        </div>
        <div className="p-col-3">
          <Button
            label="Reverse Position"
            className="p-button-warning"
            style={{ width: "100%", height: "100%" }}
            onClick={() =>
              this.setState({ reversePositionDialogVisible: true })
            }
          />
          <Dialog
            header="Reverse Position"
            visible={reversePositionDialogVisible}
            style={{ width: "50vw" }}
            position="top"
            onHide={() =>
              this.setState({ reversePositionDialogVisible: false })
            }
            footer={this.renderReversePositionDialogFooter()}
          >
            <p>Are you sure to Reverse Position on Market price?</p>
          </Dialog>
        </div>
        <div className="p-col-3">
          <Button
            label="Cancel Stop Orders"
            style={{ width: "100%", height: "100%" }}
            onClick={this.cancelStopOrders}
          />
        </div>
        <div className="p-col-3">
          <Button
            label="Btn 5"
            className="p-button-success"
            style={{ width: "100%", height: "100%" }}
            onClick={console.log}
          />
        </div>
        <div className="p-col-3">
          <Button
            label="Btn 6"
            className="p-button-secondary"
            style={{ width: "100%", height: "100%" }}
            onClick={console.log}
          />
        </div>
        <div className="p-col-3">
          <Button
            label="Btn 7"
            className="p-button-secondary"
            style={{ width: "100%", height: "100%" }}
            onClick={console.log}
          />
        </div>
        <div className="p-col-3">
          <Button
            label="Btn 8"
            className="p-button-secondary"
            style={{ width: "100%", height: "100%" }}
            onClick={console.log}
          />
        </div>
        <div className="p-col-3">
          <Button
            label="Btn 9"
            className="p-button-secondary"
            style={{ width: "100%", height: "100%" }}
            onClick={console.log}
          />
        </div>
        <div className="p-col-3">
          <Button
            label="Btn 10"
            className="p-button-secondary"
            style={{ width: "100%", height: "100%" }}
            onClick={console.log}
          />
        </div>
        <div className="p-col-3">
          <Button
            label="Btn 11"
            className="p-button-secondary"
            style={{ width: "100%", height: "100%" }}
            onClick={console.log}
          />
        </div>
        <div className="p-col-3">
          <Button
            label="Btn 12"
            className="p-button-secondary"
            style={{ width: "100%", height: "100%" }}
            onClick={console.log}
          />
        </div>
      </div>
    );
  }
}
