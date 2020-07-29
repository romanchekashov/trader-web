import * as React from "react";
import {useState} from "react";
import {Dropdown} from "primereact/components/dropdown/Dropdown";
import {Button} from "primereact/components/button/Button";
import {TradeStrategyAnalysisFilterDto} from "../../../data/TradeStrategyAnalysisFilterDto";
import {Interval} from "../../../data/Interval";
import {TradingPlatform} from "../../../data/trading/TradingPlatform";
import {PrimeDropdownItem} from "../../../utils/utils";
import {BrokerId} from "../../../data/BrokerId";

type Props = {
    onSelectStrategy: (filter: TradeStrategyAnalysisFilterDto) => void
};

const StrategyBtn: React.FC<Props> = ({onSelectStrategy}) => {

    const intervals: PrimeDropdownItem<Interval>[] = [
        Interval.M1, Interval.M3, Interval.M5, Interval.M15,
        Interval.M30, Interval.M60, Interval.H2, Interval.DAY
    ]
        .map(val => ({label: val, value: val}));

    const [highTimeFrame, setHighTimeFrame] = useState(Interval.M30);
    const [tradingTimeFrame, setTradingTimeFrame] = useState(Interval.M5);
    const [lowTimeFrame, setLowTimeFrame] = useState(Interval.M1);

    const selectStrategy = () => {
        onSelectStrategy({
            brokerId: BrokerId.ALFA_DIRECT,
            tradingPlatform: TradingPlatform.QUIK,
            secId: null,
            classCode: null,
            secCode: null,
            timeFrameTrading: tradingTimeFrame,
            timeFrameMin: lowTimeFrame
        })
    };

    return (
        <div className="p-grid">
            <div className="p-col-2">
                <Dropdown value={highTimeFrame} options={intervals} onChange={(e) => {
                    setHighTimeFrame(e.value)
                }}/>
            </div>
            <div className="p-col-2">
                <Dropdown value={tradingTimeFrame} options={intervals} onChange={(e) => {
                    setTradingTimeFrame(e.value)
                }}/>
            </div>
            <div className="p-col-2">
                <Dropdown value={lowTimeFrame} options={intervals} onChange={(e) => {
                    setLowTimeFrame(e.value)
                }}/>
            </div>
            <div className="p-col-2">
                <Button label="Change" style={{width: '100%'}} onClick={selectStrategy}/>
            </div>
        </div>
    )
};

export default StrategyBtn;