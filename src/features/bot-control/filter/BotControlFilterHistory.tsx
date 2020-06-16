import * as React from "react";
import {useEffect, useState} from "react";
import {ToggleButton} from "primereact/togglebutton";
import {Calendar} from "primereact/calendar";
import {Button} from "primereact/button";

export interface BotControlFilterHistoryState {
    history: boolean
    debug: boolean
}

type Props = {
    minStartDate: Date
    maxEndDate: Date
    start: Date
    end: Date
    onEnabled: (history: boolean) => void
    onStartDate: (start: Date) => void
    onEndDate: (end: Date) => void
    onDebug: (debug: boolean) => void
    onStop: () => void
};

export const BotControlFilterHistory: React.FC<Props> = ({
                                                             minStartDate, maxEndDate, start, end, onEnabled, onStartDate,
                                                             onEndDate, onDebug, onStop
                                                         }) => {
    let initState: BotControlFilterHistoryState = {
        history: false,
        debug: false
    };

    const [history, setHistory] = useState(initState.history);

    const onHistory = (history: boolean) => {
        setHistory(history);
        onEnabled(history);
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
                <div className="p-grid">
                    <div className="p-col-4">
                        <div style={{fontSize: "10px"}}>Start</div>
                        <Calendar value={start}
                                  minDate={minStartDate}
                                  maxDate={maxEndDate}
                                  onChange={(e) => onStartDate(e.value as any)}
                                  showTime={true}
                                  inputStyle={{width: "90px"}}/>
                    </div>


                    <div className="p-col-4">
                        <div style={{fontSize: "10px"}}>End</div>
                        <Calendar value={end}
                                  minDate={minStartDate}
                                  maxDate={maxEndDate}
                                  onChange={(e) => onEndDate(e.value as any)}
                                  showTime={true}
                                  inputStyle={{width: "90px"}}/>

                    </div>


                    <div className="p-col-4">
                        <ToggleButton checked={debug} onChange={(e) => onDebugClicked(e.value)} onLabel="Debug"
                                      offLabel="Debug"
                                      style={{marginLeft: '10px'}}/>
                        {debug ? <Button label="Stop" onClick={onStopClicked} className="p-button-danger"
                                         style={{marginLeft: '10px'}}/> : null}
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="p-grid">
            <div className="p-col-3">
                <ToggleButton checked={history} onChange={(e) => onHistory(e.value)} onLabel="History" offLabel="History"/>
            </div>
            <div className="p-col-9">
                {showDateSelect()}
            </div>
        </div>
    )
};