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
import { getActiveTrades } from "../../common/api/rest/traderRestApi";

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
            .on<ActiveTrade>(StackEvent.ACTIVE_TRADE_SELECTED)
            .subscribe(selectActiveTrade)

        // Specify how to clean up after this effect:
        return function cleanup() {
            stackEventsListener.unsubscribe()
            document.querySelector(".header").classList.remove('header-sticky')
        }
    }, [offsetHeight, securities])

    useEffect(() => {
        getActiveTrades().then(updateActiveTrades)

        const lastSecuritiesSubscription = WebsocketService.getInstance()
            .on<SecurityLastInfo[]>(WSEvent.LAST_SECURITIES)
            .subscribe(securities => {
                securities = securities.filter(sec => activeTradesSecIds.indexOf(sec.id) > -1)
                securities = activeTradesSecIds.map(id => securities.find(sec => sec.id === id))
                setSecurities(securities)
                if (securities.length > 0) updateOffsetHeight()
            })

        const activeTradeSubscription = WebsocketService.getInstance()
            .on<ActiveTrade[]>(WSEvent.ACTIVE_TRADES).subscribe(updateActiveTrades)

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

    const updateActiveTrades = (activeTrades: ActiveTrade[]): void => {
        setActiveTrades(activeTrades)
        if (activeTrades.some(at => activeTradesSecIds.indexOf(at.secId) === -1)) {
            setActiveTradesSecIds(activeTrades.map(at => at.secId))
        }
    }

    const updateOffsetHeight = (): void => {
        let h = document.querySelector(".active-trades-securities").clientHeight
        if (h) h += 30
        if (offsetHeight !== h) setOffsetHeight(h || DEFAULT_OFFSET_HEIGHT)
    }

    const updateSize = () => {
        setHeight(window.innerHeight - 27)
    }

    const selectActiveTrade = (at: ActiveTrade): void => {
        const sec = securities.find(s => s.id === at.secId)
        onSecuritySelected(sec)
    }

    const onSecuritySelected = (sec: SecurityLastInfo): void => {
        setSelectedSecurity(sec)
        pageJumpById("trading-chart-security-" + sec.id, offsetHeight)
        StackService.getInstance().send(StackEvent.SECURITY_SELECTED, sec)
    }

    return (
        <div id="active-trades-page" style={{ paddingTop: offsetHeight }}>
            <div id="active-trades-securities-wrapper" className="fixed">

                <ActiveTradesSecurities
                    securities={securities}
                    selectedSecurity={selectedSecurity}
                    onSelectRow={onSecuritySelected} />

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