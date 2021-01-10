import * as React from "react";
import { useEffect, useState } from "react";
import "./ActiveTradesPage.css"
import { WebsocketService, WSEvent } from "../../common/api/WebsocketService";
import { ActiveTrade } from "../../common/data/ActiveTrade";
import { SecurityLastInfo } from "../../common/data/security/SecurityLastInfo";
import { TradingChartsSecurity } from "../trading-charts/security/TradingChartsSecurity";
import { TEST_ACTIVE_TRADES } from "../../common/utils/TestData";
import { getLastSecurities } from "../../common/api/rest/analysisRestApi";
import { StackEvent, StackService } from "../../common/components/stack/StackService";
import { pageJumpById } from "../../common/utils/utils";

export const ActiveTradesPage = () => {
    const [height, setHeight] = useState<number>(200)
    const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([])
    const [activeTradesSecIds, setActiveTradesSecIds] = useState<number[]>([])
    const [securities, setSecurities] = useState<SecurityLastInfo[]>([])

    useEffect(() => {

        const stackEventsListener = StackService.getInstance()
            .on<ActiveTrade>(StackEvent.ACTIVE_TRADE_SELECTED).subscribe(at => {
                pageJumpById("trading-chart-security-" + at.secId)
            })

        const lastSecuritiesSubscription = WebsocketService.getInstance()
            .on<SecurityLastInfo[]>(WSEvent.LAST_SECURITIES)
            .subscribe(securities => {
                securities = securities.filter(sec => activeTradesSecIds.indexOf(sec.id) > -1)
                setSecurities(activeTradesSecIds.map(id => securities.find(sec => sec.id === id)))
            })

        const activeTradeSubscription = WebsocketService.getInstance()
            .on<ActiveTrade[]>(WSEvent.ACTIVE_TRADES).subscribe(activeTrades => {
                setActiveTrades(activeTrades)
                if (activeTrades.some(at => activeTradesSecIds.indexOf(at.secId) === -1)) {
                    setActiveTradesSecIds(activeTrades.map(at => at.secId))
                }
            })

        // TestData
        // const activeTrades = TEST_ACTIVE_TRADES
        // if (activeTrades.some(at => activeTradesSecIds.indexOf(at.secId) === -1)) {
        //     const activeTradesSecIds = activeTrades.map(at => at.secId)

        //     getLastSecurities().then(securities => {
        //         securities = securities.filter(sec => activeTradesSecIds.indexOf(sec.id) > -1)
        //         setSecurities(activeTradesSecIds.map(id => securities.find(sec => sec.id === id)))
        //     })
        // }

        updateSize()
        window.addEventListener('resize', updateSize)

        // Specify how to clean up after this effect:
        return function cleanup() {
            lastSecuritiesSubscription.unsubscribe()
            activeTradeSubscription.unsubscribe()
            stackEventsListener.unsubscribe()
            window.removeEventListener('resize', updateSize)
        }
    }, [activeTradesSecIds])

    const updateSize = () => {
        setHeight(window.innerHeight - 27)
    }

    return (
        <div id="active-trades-page" className="p-grid">
            {
                securities?.map(securityLastInfo => (
                    <TradingChartsSecurity
                        securityLastInfo={securityLastInfo}
                        start={null} />
                ))
            }
        </div>
    )
}