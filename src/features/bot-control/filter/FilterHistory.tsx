import * as React from "react";
import {useState} from "react";
import {ToggleButton} from "primereact/togglebutton";
import {Calendar} from "primereact/calendar";
import moment = require("moment");
import {Button} from "primereact/button";

export interface FilterHistoryState {
    history: boolean
    start: Date
    end: Date
    debug: boolean
}

type Props = {
    onEnabled: (history: boolean) => void
    onStartDate: (start: Date) => void
    onEndDate: (end: Date) => void
    onDebug: (debug: boolean) => void
    onStop: () => void
};

const FilterHistory: React.FC<Props> = ({onEnabled, onStartDate, onEndDate, onDebug, onStop}) => {
    let initState: FilterHistoryState = {
        history: false,
        start: moment().hours(10).minutes(0).seconds(0).toDate(),
        end: moment().hours(23).minutes(50).seconds(0).toDate(),
        debug: false
    };

    const [history, setHistory] = useState(initState.history);
    const [start, setStart] = useState(initState.start);
    const [end, setEnd] = useState(initState.end);
    const onHistory = (history: boolean) => {
        setHistory(history);
        onEnabled(history);
    };

    const setStartDate = (start: any) => {
        setStart(start);
        onStartDate(start);
    };

    const setEndDate = (end: any) => {
        setEnd(end);
        onEndDate(end);
    };

    const [debug, setDebug] = useState(initState.debug);

    const onDebugClicked = (debug: boolean) => {
        setDebug(debug);
        onDebug(debug);
    };

    const onStopClicked = () => {
        onStop();
    };

    const showDateSelect = () => {
        if (history) {
            return (
                <>
                    <div style={{lineHeight: '22px', margin: '5px'}}>Start:</div>
                    <Calendar value={start} onChange={(e) => setStartDate(e.value)}
                              showTime={true} showSeconds={true} inputStyle={{width: "90px"}} />
                    <div style={{lineHeight: '22px', margin: '5px'}}>End:</div>
                    <Calendar value={end} onChange={(e) => setEndDate(e.value)}
                              showTime={true} showSeconds={true} inputStyle={{width: "90px"}} />

                    <ToggleButton checked={debug} onChange={(e) => onDebugClicked(e.value)} onLabel="Debug" offLabel="Debug"
                                  style={{marginLeft: '10px'}} />
                    {debug ? <Button label="Stop" onClick={onStopClicked} className="p-button-danger" style={{marginLeft: '10px'}}/> : null}
                </>
            );
        }
    };

    return (
        <>
            <ToggleButton checked={history} onChange={(e) => onHistory(e.value)} onLabel="History" offLabel="History" />
            {showDateSelect()}
        </>
    )
};

export default FilterHistory;