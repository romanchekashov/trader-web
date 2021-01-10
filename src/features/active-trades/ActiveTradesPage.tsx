import * as React from "react";
import { useEffect, useState } from "react";
import "./ActiveTradesPage.css"
import { News } from "../../common/components/news/News";
import { WebsocketService, WSEvent } from "../../common/api/WebsocketService";
import { ActiveTrade } from "../../common/data/ActiveTrade";
import { SecurityLastInfo } from "../../common/data/security/SecurityLastInfo";

export const ActiveTradesPage = () => {
    const [height, setHeight] = useState<number>(200)
    const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([])
    const [activeTradesSecIds, setActiveTradesSecIds] = useState<any>({})
    const [securities, setSecurities] = useState<SecurityLastInfo[]>([])

    useEffect(() => {

        const lastSecuritiesSubscription = WebsocketService.getInstance()
            .on<SecurityLastInfo[]>(WSEvent.LAST_SECURITIES)
            .subscribe(securities => {
                setSecurities(securities.filter(sec => activeTradesSecIds[sec.id]))
            })

        const activeTradeSubscription = WebsocketService.getInstance()
            .on<ActiveTrade[]>(WSEvent.ACTIVE_TRADES).subscribe(activeTrades => {
                setActiveTrades(activeTrades)
                if (activeTrades.some(at => !activeTradesSecIds[at.secId])) {
                    const map = {}
                    for (const at of activeTrades) map[at.secId] = true
                    setActiveTradesSecIds(map)
                }
            })

        updateSize()
        window.addEventListener('resize', updateSize)

        // Specify how to clean up after this effect:
        return function cleanup() {
            lastSecuritiesSubscription.unsubscribe()
            activeTradeSubscription.unsubscribe()
            window.removeEventListener('resize', updateSize)
        }
    }, [activeTradesSecIds])

    const updateSize = () => {
        setHeight(window.innerHeight - 27)
    }

    return (
        <div id="news-page" className="p-grid" style={{ height: height }}>
            <News />
        </div>
    )
}