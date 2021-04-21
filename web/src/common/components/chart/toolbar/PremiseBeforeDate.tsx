import * as React from "react";
import {useState} from "react";
import {Button} from "primereact/button";
import {Calendar} from "primereact/calendar";
import "./PremiseBeforeDate.css"
import moment = require("moment");

type Props = {
    onBeforeChanged: (before: Date) => void
}

export const PremiseBeforeDate: React.FC<Props> = ({onBeforeChanged}) => {

    const getInitDate = () => {
        const date = new Date()
        date.setHours(10)
        date.setMinutes(0)
        date.setSeconds(0)
        date.setMilliseconds(0)
        return date
    }
    const [calendarVisible, setCalendarVisible] = useState<boolean>(false)
    const [before, setBefore] = useState<Date>(getInitDate())

    const changeCalendarVisible = (visible: boolean) => {
        setCalendarVisible(visible)
        if (!visible) {
            changeDate(null)
        }
    }

    const changeDate = (date: Date) => {
        setBefore(date)
        onBeforeChanged(date)
    }

    return (
        <div className="premise-before-date">
            <Button label="P"
                    className={calendarVisible ? "" : "p-button-secondary"}
                    onClick={event => changeCalendarVisible(!calendarVisible)}/>
            {
                calendarVisible ?
                    <Calendar value={before}
                              dateFormat={'dd/mm'}
                              showTime={true}
                              onSelect={(e) => changeDate(e.value as Date)}/>
                    : null
            }
        </div>
    )
}