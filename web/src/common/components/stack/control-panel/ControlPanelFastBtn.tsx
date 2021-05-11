import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import * as React from "react";
import { useEffect, useState } from "react";
import {
  deleteActiveTrades,
  selectActiveTrades,
} from "../../../../app/activeTrades/activeTradesSlice";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import quikOrdersApi from "../../../../app/orders/quikOrdersApi";
import { deleteStopOrdersBySecId } from "../../../../app/stops/stopsSlice";
import { ActiveTrade } from "../../../data/ActiveTrade";

type Props = {
  growl: any;
  activeTrade: ActiveTrade;
  history?: boolean;
};

export const ControlPanelFastBtn: React.FC<Props> = ({
  growl,
  activeTrade,
  history,
}) => {
  const dispatch = useAppDispatch();
  const { deleteActiveTradesLoadingError } = useAppSelector(selectActiveTrades);

  useEffect(() => {
    if (deleteActiveTradesLoadingError) {
      growl.show({
        severity: "error",
        summary: "Error Message",
        detail: deleteActiveTradesLoadingError,
      });
    }
  }, [deleteActiveTradesLoadingError]);

  const [
    terminatePositionDialogVisible,
    setTerminatePositionDialogVisible,
  ] = useState<boolean>(false);
  const [
    reversePositionDialogVisible,
    setReversePositionDialogVisible,
  ] = useState<boolean>(false);

  const cancelActiveOrders = () => {
    quikOrdersApi.deleteOrdersBySecId(activeTrade?.secId);
  };

  const cancelStopOrders = () => {
    dispatch(deleteStopOrdersBySecId(activeTrade?.secId));
  };

  const terminatePosition = () => {
    dispatch(deleteActiveTrades(activeTrade?.secId));
  };

  const reversePosition = () => {
    // WebsocketService.getInstance().send(
    //   history ? WSEvent.HISTORY_REVERSE_POSITION : WSEvent.REVERSE_POSITION
    // );
  };

  const renderTerminatePositionDialogFooter = () => {
    return (
      <div>
        <Button
          label="Yes"
          icon="pi pi-check"
          onClick={(e) => {
            setTerminatePositionDialogVisible(false);
            terminatePosition();
          }}
        />
        <Button
          label="No"
          icon="pi pi-times"
          onClick={() => setTerminatePositionDialogVisible(false)}
          className="p-button-secondary"
        />
      </div>
    );
  };

  const renderReversePositionDialogFooter = () => {
    return (
      <div>
        <Button
          label="Yes"
          icon="pi pi-check"
          onClick={(e) => {
            setReversePositionDialogVisible(false);
            reversePosition();
          }}
        />
        <Button
          label="No"
          icon="pi pi-times"
          onClick={() => setReversePositionDialogVisible(false)}
          className="p-button-secondary"
        />
      </div>
    );
  };

  return (
    <div className="p-grid fast-btn">
      <div className="p-col-3">
        <Button
          label="Cancel Active Orders"
          style={{ width: "100%", height: "100%" }}
          onClick={cancelActiveOrders}
        />
      </div>
      <div className="p-col-3">
        <Button
          label="Terminate Position"
          style={{ width: "100%", height: "100%" }}
          className="p-button-danger"
          onClick={() => setTerminatePositionDialogVisible(true)}
        />
        <Dialog
          header="Terminate Position"
          visible={terminatePositionDialogVisible}
          style={{ width: "50vw" }}
          position="top"
          onHide={() => setTerminatePositionDialogVisible(false)}
          footer={renderTerminatePositionDialogFooter()}
        >
          <p>Are you sure to Terminate Position on Market price?</p>
        </Dialog>
      </div>
      <div className="p-col-3">
        <Button
          label="Reverse Position"
          className="p-button-warning"
          style={{ width: "100%", height: "100%" }}
          onClick={() => setReversePositionDialogVisible(true)}
        />
        <Dialog
          header="Reverse Position"
          visible={reversePositionDialogVisible}
          style={{ width: "50vw" }}
          position="top"
          onHide={() => setReversePositionDialogVisible(false)}
          footer={renderReversePositionDialogFooter()}
        >
          <p>Are you sure to Reverse Position on Market price?</p>
        </Dialog>
      </div>
      <div className="p-col-3">
        <Button
          label="Cancel Stop Orders"
          style={{ width: "100%", height: "100%" }}
          onClick={cancelStopOrders}
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
};
