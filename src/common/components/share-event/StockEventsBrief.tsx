import * as React from "react"
import {useEffect, useState} from "react"
import {SecurityShareEvent} from "../../data/news/SecurityShareEvent"
import {getSecurityShareEvents} from "../../api/rest/analysisRestApi"
import "./StockEventsBrief.css"
import moment = require("moment");

type Props = {
    secCode: string
}

export const StockEventsBrief: React.FC<Props> = ({secCode}) => {
    const [events, setEvents] = useState<SecurityShareEvent[]>([])
    const [selectedEvent, setSelectedEvent] = useState<SecurityShareEvent>(null)

    useEffect(() => {
        if (secCode) {
            getSecurityShareEvents(secCode)
                .then(events => {
                    setEvents(events)
                    if (events.length > 0) setSelectedEvent(events[0])
                })
        }
    }, [secCode])

    const formatEvent = (event: SecurityShareEvent) => {
        const date = moment(event.date).format("DD-MM-YYYY")
        const published = moment(event.published).format("DD-MM-YYYY HH:mm")

        return (
            <>
                <h3>{event.title} ({date})</h3>
                <p>Pub: {published} by {event.newsProvider} <a href={event.href} target="_blank">{event.href}</a></p>
                <div dangerouslySetInnerHTML={{__html: selectedEvent.htmlText}}></div>
            </>
        )
    }

    return (
        <div className="p-grid">
            <div className="p-col-12" style={{padding: 0, height: 800, overflowY: "scroll"}}>
                {
                    events.map((shareEvent, index) => {
                        const date = moment(shareEvent.date).format("DD-MM-YYYY");
                        const published = moment(shareEvent.published).format("DD-MM-YYYY HH:mm");
                        const isSelected = selectedEvent && shareEvent.title === selectedEvent.title
                            && shareEvent.published.getTime() === selectedEvent.published.getTime()

                        let className = "menu-item-brief"
                        if (isSelected) {
                            className += " menu-item-brief-selected"
                        } else if (index % 2 === 0) {
                            className += " menu-item-brief-even"
                        }

                        return (
                            <div className={className}
                                 onClick={(e) => setSelectedEvent(shareEvent)}>
                                <div className="menu-item-brief-pub">Pub: {published} by {shareEvent.newsProvider}</div>
                                <div className="menu-item-brief-title">{shareEvent.title} ({date})</div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}