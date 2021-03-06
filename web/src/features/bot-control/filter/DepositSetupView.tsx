import * as React from "react";
import {useState} from "react";
import {DepositSetup} from "../../../common/data/DepositSetup";
import {InputText} from "primereact/inputtext";
import {PrimeDropdownItem, round10} from "../../../common/utils/utils";
import {Dropdown} from "primereact/dropdown";
import {Deposit} from "../../../common/data/Deposit";
import {ClassCode} from "../../../common/data/ClassCode";
import {SecurityLastInfo} from "../../../common/data/security/SecurityLastInfo";

type Props = {
    security: SecurityLastInfo,
    realDeposit: Deposit
    setup: DepositSetup
    onChange: (setup: DepositSetup) => void
    canTrade: (canTrade: boolean) => void
};

export const DepositSetupView: React.FC<Props> = ({security, realDeposit, setup, onChange, canTrade}) => {

    const takeProfitNumbers: PrimeDropdownItem<number>[] = [1, 2].map(val => ({label: "" + val, value: val}));
    const [takeProfitNumber, setTakeProfitNumber] = useState(2);

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

    let minDepoPerContract = 1

    switch (security?.classCode) {
        case ClassCode.CETS:
            break
        case ClassCode.SPBFUT:
            minDepoPerContract = security.futureBuyDepoPerContract > security.futureSellDepoPerContract ?
                security.futureBuyDepoPerContract : security.futureSellDepoPerContract
            break
        case ClassCode.TQBR:
            break
    }

    let maxQuantity = 0
    let maxDepo = 0

    if (realDeposit) {
        maxQuantity = Math.floor(realDeposit.amount / minDepoPerContract)
        maxDepo = Math.ceil(maxQuantity * minDepoPerContract)
        canTrade(setup.initAmount > minDepoPerContract)
    }

    return (
        <div className="p-grid">
            <div className="p-col-1">
                <div style={{fontWeight: 700, color: "red"}}>Real deposit: {realDeposit?.amount}</div>
                <div>Depo per Contract: {minDepoPerContract}</div>
                <div>Max contracts: {maxQuantity}</div>
                <div>Max deposit: {maxDepo}</div>
            </div>
            <div className="p-col-1">
                <div style={{fontSize: "10px"}}>
                    Deposit (<span style={{fontWeight: 700, color: "red"}}>Real: {realDeposit?.amount}</span>)
                </div>
                <InputText type="number"
                           min={0}
                           value={setup.amount}
                           onChange={(e) => {
                               setup.initAmount = e.target['value']
                               setup.amount = setup.initAmount
                               setStop(getStopByAmount(setup.amount))
                               onChange(setup)
                           }}
                           style={{width: '90px'}}/>
            </div>
            <div className="p-col-1">
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
            <div className="p-col-1">
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
            <div className="p-col-1">
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
            <div className="p-col-1">
                <div style={{fontSize: "10px"}}>Take Profits Number</div>
                <Dropdown value={takeProfitNumber} options={takeProfitNumbers}
                          onChange={(e) => {
                              setTakeProfitNumber(e.value)
                              if (e.value === 1) {
                                  setup.takeProfitPerTradeFactorSecond = 0;
                              } else {
                                  setup.takeProfitPerTradeFactorSecond = 4;
                              }
                          }}
                          style={{width: '60px'}}/>
            </div>
            <div className="p-col-1">
                <div style={{fontSize: "10px"}}>First Take Profit Per Trade Factor</div>
                <InputText type="number"
                           min={1}
                           value={setup.takeProfitPerTradeFactorFirst}
                           onKeyDown={(e) => {
                           }}
                           onChange={(e) => {
                               setup.takeProfitPerTradeFactorFirst = parseInt(e.target['value']);
                               onChange(setup);
                           }}
                           style={{width: '80px'}}/>
            </div>
            <div className="p-col-1">
                <div style={{fontSize: "10px"}}>First Take Profit Per Trade</div>
                <InputText value={setup.takeProfitPerTradeFactorFirst * stop}
                           onKeyDown={(e) => {
                           }}
                           onChange={(e) => {
                           }}
                           style={{width: '80px'}}/>
            </div>
            <div className="p-col-1">
                <div style={{fontSize: "10px"}}>Second Take Profit Per Trade Factor</div>
                <InputText type="number"
                           min={2}
                           value={setup.takeProfitPerTradeFactorSecond}
                           onKeyDown={(e) => {
                           }}
                           onChange={(e) => {
                               setup.takeProfitPerTradeFactorSecond = parseInt(e.target['value']);
                               onChange(setup);
                           }}
                           disabled={takeProfitNumber === 1}
                           style={{width: '80px'}}/>
            </div>
            <div className="p-col-1">
                <div style={{fontSize: "10px"}}>Second Take Profit Per Trade</div>
                <InputText value={setup.takeProfitPerTradeFactorSecond * stop}
                           onKeyDown={(e) => {
                           }}
                           onChange={(e) => {
                           }}
                           disabled={takeProfitNumber === 1}
                           style={{width: '80px'}}/>
            </div>
        </div>
    )
};