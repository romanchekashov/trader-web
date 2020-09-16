import * as React from "react";
import {useState} from "react";
import {Button} from "primereact/button";
import {Calendar} from "primereact/calendar";
import "./PremiseBeforeDate.css"

type Props = {
    onBeforeChanged: (before: Date) => void
}

export const PremiseBeforeDate: React.FC<Props> = ({onBeforeChanged}) => {

    const [calendarVisible, setCalendarVisible] = useState<boolean>(false)
    const [before, setBefore] = useState<Date>(new Date())

    return (
        <div className="premise-before-date">
            <Button label="P"
                    className={calendarVisible ? "" : "p-button-secondary"}
                    onClick={event => setCalendarVisible(!calendarVisible)}/>
            {
                calendarVisible ?
                    <Calendar value={before}
                              dateFormat={'dd/mm'}
                              showTime={true}
                              onSelect={(e) => {
                                  setBefore(e.value as Date)
                                  onBeforeChanged(e.value as Date)
                              }}/>
                    : null
            }
        </div>
    )
}