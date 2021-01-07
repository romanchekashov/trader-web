import * as React from "react";
import { useEffect, useState } from "react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { WebsocketService, WSEvent } from "../../../../common/api/WebsocketService";
import { SecurityLastInfo } from "../../../../common/data/security/SecurityLastInfo";
import { Signal } from "../../../../common/data/Signal";
import { PatternName } from "../../../../common/components/alerts/data/PatternName";
import { getLastSecurities } from "../../../../common/api/rest/analysisRestApi";
import "./SecuritiesQuik.css"
import { SecurityType } from "../../../../common/data/security/SecurityType";
import { DemandSupply } from "../../../../common/components/demand-supply/DemandSupply";
import moment = require("moment");
import { SecurityTypeWrapper } from "../../../../common/data/security/SecurityTypeWrapper";
import { formatNumber } from "../../../../common/utils/utils";

type Props = {
    secType: SecurityTypeWrapper
    selectedSecurity: SecurityLastInfo
    onSelectRow: (e: SecurityLastInfo) => void
    onLastTimeUpdate: (lastTimeUpdate: Date) => void
}

export const SecuritiesQuik: React.FC<Props> = ({ secType, selectedSecurity, onSelectRow, onLastTimeUpdate }) => {
    const [securities, setSecurities] = useState<SecurityLastInfo[]>([])

    const columns = [
        { field: 'id', header: 'Id' },
        { field: 'type', header: 'Type' },
        { field: 'shortName', header: 'Наз' },
        { field: 'secCode', header: 'Тикер' },
        { field: 'lastChange', header: '% изм' },
        { field: 'lastTradePrice', header: 'Цен посл' },
        { field: 'totalDemand', header: 'Об спр/пред' },
        { field: 'valueToday', header: 'Оборот' },
        { field: 'volumeToday', header: 'Vol Today' },
        { field: 'percentOfFreeFloatTradedToday', header: '% FreeFlt Tr' },
        { field: 'freeFloatInPercent', header: 'FreeFlt(%)' },
        { field: 'distancePassedSinceLastDayCloseRelativeToAtrAvg', header: 'GAtrDis AVG(D)%' },
        { field: 'distancePassedSinceLastDayCloseRelativeToAtr', header: 'GAtrDis (D)%' },
        { field: 'atrDay', header: 'ATR(D)' },
        // { field: 'atrM60', header: 'ATR(M60)' },
        { field: 'atrM30', header: 'ATR(M30)' },
        // { field: 'atrM3', header: 'ATR(M3)' },
        { field: 'gapDay', header: 'Gap(D)' },
        { field: 'gapDayPercent', header: 'Gap(D)%' },
        { field: 'volumeInPercentDay', header: 'Vol(D)%' },
        { field: 'volumeInPercentM60', header: 'Vol(M60)%' },
        { field: 'volumeInPercentM30', header: 'Vol(M30)%' },
        { field: 'volumeInPercentM3', header: 'Vol(M3)%' },
        { field: 'relativeVolumeDay', header: 'Rel Vol(D)' },
        { field: 'numTradesToday', header: 'Кол сд' },
        { field: 'signals', header: 'Signals' }
    ]

    const lessColumns = [
        { field: 'id', header: 'Id' },
        { field: 'type', header: 'Type' },
        { field: 'shortName', header: 'Наз' },
        { field: 'lastChange', header: '% изм' },
        { field: 'lastTradePrice', header: 'Цен посл' },
        { field: 'totalDemand', header: 'Об спр/пред' },
        { field: 'distancePassedSinceLastDayCloseRelativeToAtrAvg', header: 'GAtrDis AVG(D)%' },
        { field: 'distancePassedSinceLastDayCloseRelativeToAtr', header: 'GAtrDis (D)%' }
    ]

    useEffect(() => {

        getLastSecurities().then(securities => {
            if (secType && securities?.length > 0) {
                setSecurities(filterSecurities(securities, secType))
            } else {
                setSecurities(securities)
            }
            onLastTimeUpdate(new Date())
        })

        const lastSecuritiesSubscription = WebsocketService.getInstance()
            .on<SecurityLastInfo[]>(WSEvent.LAST_SECURITIES)
            .subscribe(securities => {
                setSecurities(secType ? filterSecurities(securities, secType) : securities)
                onLastTimeUpdate(new Date())
            })

        // Specify how to clean up after this effect:
        return function cleanup() {
            lastSecuritiesSubscription.unsubscribe()
        }
    }, [secType])

    const filterSecurities = (securities: SecurityLastInfo[], secType: SecurityTypeWrapper): SecurityLastInfo[] => {
        return securities.filter(value => {
            switch (secType) {
                case SecurityTypeWrapper.FUTURE:
                    return value.type === SecurityType.FUTURE
                case SecurityTypeWrapper.STOCK:
                    return value.type === SecurityType.STOCK
                case SecurityTypeWrapper.STOCK_1:
                    return value.type === SecurityType.STOCK && value.shareSection === 1
                case SecurityTypeWrapper.STOCK_2:
                    return value.type === SecurityType.STOCK && value.shareSection === 2
                case SecurityTypeWrapper.STOCK_3:
                    return value.type === SecurityType.STOCK && value.shareSection === 3
                case SecurityTypeWrapper.CURRENCY:
                    return value.type === SecurityType.CURRENCY
            }
        })
    }

    const getCandlePatternClassName = (alert: Signal) => {
        let className = "";
        const name = alert.name.split("-")[1];
        const sInterval = alert.interval.toString();

        if (PatternName.BEARISH_REVERSAL_PATTERN_DARK_CLOUD_COVER === name) {
            className += "bearish-reversal-pattern-dark-cloud-cover-" + sInterval.toLowerCase();
        } else if (PatternName.BEARISH_REVERSAL_PATTERN_ENGULFING === name) {
            className += "bearish-reversal-pattern-engulfing-" + sInterval.toLowerCase();
        } else if (PatternName.BEARISH_REVERSAL_PATTERN_EVENING_STAR === name) {
            className += "bearish-reversal-pattern-evening-star-" + sInterval.toLowerCase();
        } else if (PatternName.BEARISH_REVERSAL_PATTERN_HANGING_MAN === name) {
            className += "bearish-reversal-pattern-hanging-man-" + sInterval.toLowerCase();
        } else if (PatternName.BEARISH_REVERSAL_PATTERN_HARAMI === name) {
            className += "bearish-reversal-pattern-harami-" + sInterval.toLowerCase();
        } else if (PatternName.BEARISH_REVERSAL_PATTERN_SHOOTING_STAR === name) {
            className += "bearish-reversal-pattern-shooting-star-" + sInterval.toLowerCase();
        } else if (PatternName.BULLISH_REVERSAL_PATTERN_ENGULFING === name) {
            className += "bullish-reversal-pattern-engulfing-" + sInterval.toLowerCase();
        } else if (PatternName.BULLISH_REVERSAL_PATTERN_HAMMER === name) {
            className += "bullish-reversal-pattern-hammer-" + sInterval.toLowerCase();
        } else if (PatternName.BULLISH_REVERSAL_PATTERN_HARAMI === name) {
            className += "bullish-reversal-pattern-harami-" + sInterval.toLowerCase();
        } else if (PatternName.BULLISH_REVERSAL_PATTERN_INVERTED_HAMMER === name) {
            className += "bullish-reversal-pattern-inverted-hammer-" + sInterval.toLowerCase();
        } else if (PatternName.BULLISH_REVERSAL_PATTERN_MORNING_STAR === name) {
            className += "bullish-reversal-pattern-morning-star-" + sInterval.toLowerCase();
        } else if (PatternName.BULLISH_REVERSAL_PATTERN_PIERCING === name) {
            className += "bullish-reversal-pattern-piercing-" + sInterval.toLowerCase();
        } else if (PatternName.REVERSAL_PATTERN_DOJI === name) {
            className += "reversal-pattern-doji-" + sInterval.toLowerCase();
        }
        return className;
    }

    const nameTemplate = (signal: Signal) => {
        let className = "alert-icon ";
        const sInterval = signal.interval.toString();
        const title = `${signal.price} - ${signal.name} - Interval: ${sInterval} - ${moment(signal.timestamp).format("HH:mm DD-MM-YYYY")}`;
        const sArr = signal.name.split("-");

        if (sArr.length > 1) {
            if ("CANDLE_PATTERN" === sArr[0]) {
                className += getCandlePatternClassName(signal);
            } else if ("PRICE_CLOSE_TO_SR_LEVEL" === sArr[0]) {
                const cls = signal.name.replace("PRICE_CLOSE_TO_SR_LEVEL", "sr_level_cross");
                className += cls.toLowerCase() + "-" + sInterval.toLowerCase();
            } else if ("PRICE_CLOSE_TO_TREND_LINE" === sArr[0]) {
                const cls = signal.name.replace("PRICE_CLOSE_TO_TREND_LINE", "trend_line_cross");
                className += cls.toLowerCase() + "-" + sInterval.toLowerCase();
            } else if ("SR_ZONE_CROSS" === sArr[0]) {
                className += signal.name.toLowerCase();
            } else {
                className += signal.name.toLowerCase() + "-" + sInterval.toLowerCase();
            }
        }

        return <div key={signal.securityType + signal.ticker + signal.price + title}
            className={className}
            title={signal.description}></div>
    }

    const signalsTemplate = (rowData, column) => {
        if (rowData.signals && rowData.signals.length > 0) {
            return <div className="securities-candles">
                {rowData.signals.map(signal => nameTemplate(signal))}
            </div>
        }
        return ""
    }

    const demandSupplyTemplate = (rowData, column) => {
        return (
            <DemandSupply totalDemand={rowData.totalDemand} totalSupply={rowData.totalSupply} />
        )
    }

    const demandSupplySort = (e: any) => {
        if (e.order > 0) {
            return securities.sort((a, b) => {
                if (!a.totalSupply) return -1
                if (!b.totalSupply) return 1
                if (a.totalSupply && b.totalSupply) {
                    return a.totalDemand / a.totalSupply - b.totalDemand / b.totalSupply
                }
                return 0
            })
        }
        return securities.sort((a, b) => {
            if (!a.totalSupply) return 1
            if (!b.totalSupply) return -1
            if (a.totalSupply && b.totalSupply) {
                return b.totalDemand / b.totalSupply - a.totalDemand / a.totalSupply
            }
            return 0
        })
    }

    const valueTodayTemplate = (rowData, column) => {
        return formatNumber(rowData.valueToday)
    }

    const valueTodaySort = (e: any) => {
        if (e.order > 0) {
            return securities.sort((a, b) => a.valueToday - b.valueToday)
        }
        return securities.sort((a, b) => b.valueToday - a.valueToday)
    }

    const volumeTodayTemplate = (rowData, column) => {
        return formatNumber(rowData.volumeToday)
    }

    const volumeTodaySort = (e: any) => {
        if (e.order > 0) {
            return securities.sort((a, b) => a.volumeToday - b.volumeToday)
        }
        return securities.sort((a, b) => b.volumeToday - a.volumeToday)
    }

    const shortNameTemplate = (rowData, column) => {
        return <div title={rowData.name}
            style={{
                width: '105px',
                fontWeight: SecurityType.FUTURE === rowData.type ? 'bold' : 'normal'
            }}>{rowData.shortName}</div>
    }

    const secCodeTemplate = (rowData, column) => {
        return <div style={{
            overflowX: "hidden",
            fontWeight: SecurityType.STOCK !== rowData.type ? 'bold' : 'normal'
        }}>{rowData.secCode}</div>
    }

    const typeTemplate = (rowData, column) => {
        return <div style={{
            overflowX: "hidden",
            fontWeight: SecurityType.CURRENCY === rowData.type ? 'bold' : 'normal'
        }}>{rowData.type}</div>
    }

    // const selectedColumns = selectedSecurity ? lessColumns : columns
    const selectedColumns = columns
    const columnComponents = selectedColumns.map(col => {
        if ("totalDemand" === col.field) {
            return <Column key={col.field} field={col.field} header={col.header} sortable={true}
                body={demandSupplyTemplate} sortFunction={demandSupplySort}
                style={{ width: '100px' }} />
        } else if ("signals" === col.field) {
            return <Column key={col.field} field={col.field} header={col.header} body={signalsTemplate}
                style={{ width: '300px' }} />
        } else if ("valueToday" === col.field) {
            return <Column key={col.field} field={col.field} header={col.header} sortable={true} filter={true}
                body={valueTodayTemplate} sortFunction={valueTodaySort}
                style={{ width: '70px' }} />
        } else if ("volumeToday" === col.field) {
            return <Column key={col.field} field={col.field} header={col.header} sortable={true} filter={true}
                body={volumeTodayTemplate} sortFunction={volumeTodaySort}
                style={{ width: '70px' }} />
        } else if ("secCode" === col.field) {
            return <Column key={col.field} field={col.field} header={col.header} sortable={true} filter={true}
                style={{ width: '60px' }}
                body={secCodeTemplate} />
        } else if ("shortName" === col.field) {
            return <Column key={col.field} field={col.field} header={col.header} sortable={true} filter={true}
                style={{ overflowX: "hidden", width: '90px' }}
                body={shortNameTemplate} />
        } else if ("type" === col.field) {
            return <Column key={col.field} field={col.field} header={col.header} sortable={true} filter={true}
                style={{ width: '30px' }}
                body={typeTemplate} />
        } else if ("id" === col.field) {
            return <Column key={col.field} field={col.field} header={col.header} sortable={true} filter={true}
                style={{ width: '40px', textAlign: "center" }} />
        } else if ("lastTradePrice" === col.field) {
            return <Column key={col.field} field={col.field} header={col.header} sortable={true} filter={true}
                style={{ width: '60px', textAlign: "center" }} />
        } else {
            return <Column key={col.field} field={col.field} header={col.header} sortable={true} filter={true} />
        }
    })

    const onSelect = (e) => {
        if (!Array.isArray(e.value)) {
            selectSecurity(e.value)
        }
    }

    const selectSecurity = (sec: SecurityLastInfo) => {
        onSelectRow(sec)
    }

    return (
        <>
            <DataTable value={securities} responsive
                selectionMode="single"
                selection={selectedSecurity}
                onSelectionChange={onSelect}
                scrollable={!!selectedSecurity}
                scrollHeight="200px">
                {columnComponents}
            </DataTable>
        </>
    )
}