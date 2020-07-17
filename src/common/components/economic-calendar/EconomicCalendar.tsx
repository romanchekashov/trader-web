import * as React from "react";
import {useEffect, useState} from "react";
import {EconomicCalendarEvent} from "../../data/news/EconomicCalendarEvent";
import {getEconomicCalendarEvents} from "../../api/rest/newsRestApi";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
// import '@fullcalendar/common/main.css';
// import '@fullcalendar/daygrid/main.css';
// import '@fullcalendar/timegrid/main.css';
import moment = require("moment");

type Props = {
    code?: string
    onEventSelected?: (event: EconomicCalendarEvent) => void
}

class FullCalendarEvent<T> {
    title: string
    start: Date
    data: T
}

export const EconomicCalendar: React.FC<Props> = ({code, onEventSelected}) => {
    const [events, setEvents] = useState<FullCalendarEvent<EconomicCalendarEvent>[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<EconomicCalendarEvent>(null);

    const fullCalendarOptions = {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        defaultView: 'timeGridDay',
        defaultDate: moment().format("YYYY-MM-DD"),
        header: {
            left: 'prev,next',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        editable: true
    }

    useEffect(() => {
        getEconomicCalendarEvents().then(events => {
            setEvents(events.map(value => ({
                title: value.title,
                start: value.dateTime,
                data: value
            })))
        })

        // Specify how to clean up after this effect:
        return function cleanup() {
        };
    }, [code]);

    return (
        <div className="p-grid">
            <div className="p-col-12">
                <FullCalendar plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                              headerToolbar={{
                                  left: 'prev,next today',
                                  center: 'title',
                                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                              }}
                              initialView='dayGridMonth'
                              editable={true}
                              selectable={true}
                              selectMirror={true}
                              dayMaxEvents={true}
                              events={events}
                />
            </div>
            <div className="p-col-12">
                <a href="http://sslecal2.forexprostools.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&category=_employment,_economicActivity,_inflation,_credit,_centralBanks,_confidenceIndex,_balance,_Bonds&features=datepicker,timezone,timeselector,filters&countries=25,32,4,17,39,72,14,48,26,10,6,37,7,21,43,56,52,36,5,22,12,11,35&calType=day&timeZone=18&lang=1"
                   target="_blank">Economic Calendar for Today on Investing.com</a>
            </div>
        </div>
    )
};