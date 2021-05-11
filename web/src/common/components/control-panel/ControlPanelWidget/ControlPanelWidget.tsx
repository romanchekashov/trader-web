import { Toast } from "primereact/toast";
import * as React from "react";
import { useRef, useState } from "react";
import { selectActiveTrades } from "../../../../app/activeTradesSlice";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { selectSecurities } from "../../../../app/securities/securitiesSlice";
import { SessionTradeResult } from "../../../data/SessionTradeResult";
import { ControlPanelFastBtn } from "../../stack/control-panel/ControlPanelFastBtn";
import { ControlPanelGeneralBtn } from "../../stack/control-panel/ControlPanelGeneralBtn";
import DepositView from "../../stack/deposit/DepositView";
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
    <div className="p-grid control-panel">
      <Toast ref={toast} />
      <div className="p-col-12" style={{ padding: 0, fontSize: "12px" }}>
        <SessionTradeResultView result={sessionResult} />
        <ActiveTradesView />
        <DepositView />
      </div>
      <div className="p-col-12">
        <ControlPanelGeneralBtn
          growl={toast}
          history={false}
          security={security}
        />
      </div>
      <div className="p-col-12">
        <ControlPanelFastBtn
          growl={toast}
          history={false}
          activeTrade={selected}
        />
      </div>
    </div>
  );
};

export default ControlPanelWidget;
