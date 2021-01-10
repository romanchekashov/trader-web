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
import { ActiveTradesSecurities } from "./securities/ActiveTradesSecurities";

export const ActiveTradesPage = () => {
    const DEFAULT_OFFSET_HEIGHT = 0
    const [offsetHeight, setOffsetHeight] = useState<number>(DEFAULT_OFFSET_HEIGHT)
    const [height, setHeight] = useState<number>(200)
    const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([])
    const [activeTradesSecIds, setActiveTradesSecIds] = useState<number[]>([])
    const [securities, setSecurities] = useState<SecurityLastInfo[]>([])
    const [selectedSecurity, setSelectedSecurity] = useState<SecurityLastInfo>(null)

    useEffect(() => {
        document.querySelector(".header").classList.add('header-sticky')

        const stackEventsListener = StackService.getInstance()
            .on<ActiveTrade>(StackEvent.ACTIVE_TRADE_SELECTED).subscribe(at => {
                pageJumpById("trading-chart-security-" + at.secId, offsetHeight)
            })

        // Specify how to clean up after this effect:
        return function cleanup() {
            stackEventsListener.unsubscribe()
        }
    }, [offsetHeight])

    useEffect(() => {

        const lastSecuritiesSubscription = WebsocketService.getInstance()
            .on<SecurityLastInfo[]>(WSEvent.LAST_SECURITIES)
            .subscribe(securities => {
                securities = securities.filter(sec => activeTradesSecIds.indexOf(sec.id) > -1)
                securities = activeTradesSecIds.map(id => securities.find(sec => sec.id === id))
                setSecurities(securities)
                if (securities.length > 0) updateOffsetHeight()
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
        //         securities = activeTradesSecIds.map(id => securities.find(sec => sec.id === id))
        //         setSecurities(securities)
        //         if (securities.length > 0) updateOffsetHeight()
        //     })
        // }

        updateSize()
        window.addEventListener('resize', updateSize)

        // Specify how to clean up after this effect:
        return function cleanup() {
            lastSecuritiesSubscription.unsubscribe()
            activeTradeSubscription.unsubscribe()
            window.removeEventListener('resize', updateSize)
        }
    }, [activeTradesSecIds])

    const updateOffsetHeight = (): void => {
        let h = document.querySelector(".active-trades-securities").clientHeight
        if (h) h += 30
        if (offsetHeight !== h) setOffsetHeight(h || DEFAULT_OFFSET_HEIGHT)
    }

    const updateSize = () => {
        setHeight(window.innerHeight - 27)
    }

    return (
        <div id="active-trades-page" className="p-grid" style={{ paddingTop: offsetHeight }}>
            <div id="active-trades-securities-wrapper" className="fixed">

                <ActiveTradesSecurities
                    securities={securities}
                    selectedSecurity={selectedSecurity}
                    onSelectRow={setSelectedSecurity} />

            </div>
            {
                securities?.map(securityLastInfo => (
                    <TradingChartsSecurity
                        securityLastInfo={securityLastInfo}
                        start={null}
                        layout={2} />
                ))
            }
        </div>
    )
}