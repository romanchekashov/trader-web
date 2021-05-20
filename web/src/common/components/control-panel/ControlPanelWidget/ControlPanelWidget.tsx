import { Toast } from "primereact/toast";
import * as React from "react";
import { useRef, useState } from "react";
import { selectActiveTrades } from "../../../../app/activeTrades/activeTradesSlice";
import DepositView from "../../../../app/deposits/components/DepositView/DepositView";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { selectSecurities } from "../../../../app/securities/securitiesSlice";
import { SessionTradeResult } from "../../../data/SessionTradeResult";
import OrdersTable from "../../ordersTable/OrdersTable";
import { ControlPanelFastBtn } from "../../stack/control-panel/ControlPanelFastBtn";
import { ControlPanelGeneralBtn } from "../../stack/control-panel/ControlPanelGeneralBtn";
import ActiveTradesView from "../components/ActiveTradesView";
import SessionTradeResultView from "../components/SessionTradeResultView";
import "./ControlPanelWidget.css";

type Props = {};

const ControlPanelWidget: React.FC<Props> = ({}) => {
  const dispatch = useAppDispatch();
  const { security } = useAppSelector(selectSecurities);
  const { selected } = useAppSelector(selectActiveTrades);

  const toast = useRef(null);
  const [sessionResult, setSessionResult] = useState<SessionTradeResult>();

  return (
    <div className="p-grid ControlPanelWidget">
      <Toast ref={toast} />
      <div className="p-col-12" style={{ fontSize: "12px" }}>
        <SessionTradeResultView result={sessionResult} />
        <ActiveTradesView />
        <DepositView />
      </div>
      <div
        style={{ padding: "0 10px" }}
      >{`Selected active trade for securities: ${
        security ? security.shortName : "All"
      }`}</div>
      <div className="p-col-12">
        <OrdersTable />
      </div>
      <div className="p-col-12">
        <ControlPanelGeneralBtn
          growl={toast?.current}
          history={false}
          security={security}
        />
      </div>
      <div className="p-col-12">
        <ControlPanelFastBtn
          security={security}
          growl={toast?.current}
          history={false}
          activeTrade={selected}
        />
      </div>
    </div>
  );
};

export default ControlPanelWidget;
