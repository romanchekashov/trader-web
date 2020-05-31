import * as React from "react";
import {useState} from "react";
import {DepositSetup} from "../../../common/data/DepositSetup";
import {InputText} from "primereact/inputtext";
import {ToggleButton} from "primereact/togglebutton";
import {round10} from "../../../common/utils/utils";

type Props = {
    setup: DepositSetup
    onChange: (setup: DepositSetup) => void
};

export const DepositSetupView: React.FC<Props> = ({setup, onChange}) => {

    const getMaxRiskPerTradeInPercent = (stop: number): number => {
        return stop * 100 / setup.amount;
    };

    const getStop = (maxRiskPerTradeInPercent: number): number => {
        return maxRiskPerTradeInPercent * setup.amount / 100;
    };

    const getStopByAmount = (amount: number): number => {
        return setup.maxRiskPerTradeInPercent * amount / 100;
    };

    const riskChangeByKeyDown = (e, field) => {
        if (e.key === 'ArrowUp') {
            setup[field] += 0.1;
        } else if (e.key === 'ArrowDown' && setup[field] > 0) {
            setup[field] -= 0.1;
        }
        setup[field] = round10(setup[field]);
    };

    const [stop, setStop] = useState(getStop(setup.maxRiskPerTradeInPercent));

    return (
        <div className="p-grid">
            <div className="p-col-2">
                <div style={{fontSize: "10px"}}>Deposit</div>
                <InputText type="number"
                           min={0}
                           value={setup.amount}
                           onChange={(e) => {
                               setup.amount = e.target['value'];
                               setStop(getStopByAmount(setup.amount));
                               onChange(setup);
                           }}
                           style={{width: '90px'}}/>
            </div>
            <div className="p-col-2">
                <div style={{fontSize: "10px"}}>Max Stop Per Trade</div>
                <InputText type="number"
                           min={0}
                           value={stop}
                           onChange={(e) => {
                               const newStop = e.target['value'];
                               setStop(newStop);
                               setup.maxRiskPerTradeInPercent = getMaxRiskPerTradeInPercent(newStop);
                               onChange(setup);
                           }}
                           style={{width: '80px'}}/>
            </div>
            <div className="p-col-2">
                <div style={{fontSize: "10px"}}>Max Risk Per Trade In Percent</div>
                <InputText value={setup.maxRiskPerTradeInPercent}
                           onKeyDown={(e) => {
                               riskChangeByKeyDown(e, "maxRiskPerTradeInPercent");
                               setStop(getStop(setup.maxRiskPerTradeInPercent));
                               onChange(setup);
                           }}
                           onChange={(e) => {
                               setup.maxRiskPerTradeInPercent = e.target['value'];
                               setStop(getStop(setup.maxRiskPerTradeInPercent));
                               onChange(setup);
                           }}
                           style={{width: '80px'}}/>
            </div>
            <div className="p-col-2">
                <div style={{fontSize: "10px"}}>Max Risk Per Session Timeout In Percent</div>
                <InputText value={setup.maxRiskPerSessionTimeoutInPercent}
                           onKeyDown={(e) => {
                               riskChangeByKeyDown(e, "maxRiskPerSessionTimeoutInPercent");
                               onChange(setup);
                           }}
                           onChange={(e) => {
                               setup.maxRiskPerSessionTimeoutInPercent = e.target['value'];
                               onChange(setup);
                           }}
                           style={{width: '80px'}}/>
            </div>
            <div className="p-col-2">
                <div style={{fontSize: "10px"}}>Max Risk Per Session In Percent</div>
                <InputText value={setup.maxRiskPerSessionInPercent}
                           onKeyDown={(e) => {
                               riskChangeByKeyDown(e, "maxRiskPerSessionInPercent");
                               onChange(setup);
                           }}
                           onChange={(e) => {
                               setup.maxRiskPerSessionInPercent = e.target['value'];
                               onChange(setup);
                           }}
                           style={{width: '80px'}}/>
            </div>
            <div className="p-col-2">
                <ToggleButton checked={setup.demo}
                              className={setup.demo ? "" : "p-button-danger"}
                              onChange={(e) => {
                                  setup.demo = e.value;
                                  onChange(setup);
                              }}
                              onLabel="Demo"
                              offLabel="Real"
                              style={{marginLeft: '10px'}}/>
            </div>
        </div>
    )
};