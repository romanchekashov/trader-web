import * as React from "react";
import { useEffect, useState } from "react";
import "./ActiveTradesPage.css"
import { News } from "../../common/components/news/News";
import { WebsocketService, WSEvent } from "../../common/api/WebsocketService";
import { ActiveTrade } from "../../common/data/ActiveTrade";

export const ActiveTradesPage = () => {
    const [height, setHeight] = useState<number>(200)
    const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([])

    useEffect(() => {

        const activeTradeSubscription = WebsocketService.getInstance()
            .on<ActiveTrade[]>(WSEvent.ACTIVE_TRADES).subscribe(activeTrades => {
                setActiveTrades(activeTrades)
            })

        updateSize()
        window.addEventListener('resize', updateSize)

        // Specify how to clean up after this effect:
        return function cleanup() {
            activeTradeSubscription.unsubscribe()
            window.removeEventListener('resize', updateSize)
        }
    }, [])

    const updateSize = () => {
        setHeight(window.innerHeight - 27)
    }

    return (
        <div id="news-page" className="p-grid" style={{ height: height }}>
            <News />
        </div>
    )
}