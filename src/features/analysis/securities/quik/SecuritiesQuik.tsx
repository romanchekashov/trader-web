import * as React from "react";
import {useEffect, useState} from "react";
import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";
import {WebsocketService, WSEvent} from "../../../../common/api/WebsocketService";
import {SecurityLastInfo} from "../../../../common/data/SecurityLastInfo";
import {Signal} from "../../../../common/data/Signal";
import {PatternName} from "../../../../common/components/alerts/data/PatternName";
import {getLastSecurities} from "../../../../common/api/rest/analysisRestApi";
import moment = require("moment");
import "./SecuritiesQuik.css"
import {round100} from "../../../../common/utils/utils";
import {SecurityType} from "../../../../common/data/SecurityType";

type Props = {
    selectedSecurity: SecurityLastInfo
    onSelectRow: (e: SecurityLastInfo) => void
    onLastTimeUpdate: (lastTimeUpdate: Date) => void
}

export const SecuritiesQuik: React.FC<Props> = ({selectedSecurity, onSelectRow, onLastTimeUpdate}) => {
    const [securities, setSecurities] = useState<SecurityLastInfo[]>([])

    const columns = [
        {field: 'type', header: 'Type'},
        {field: 'shortName', header: 'Наз'},
        {field: 'secCode', header: 'Тикер'},
        {field: 'lastChange', header: '% изм'},
        {field: 'lastTradePrice', header: 'Цен посл'},
        {field: 'totalDemand', header: 'Об спр/пред'},
        {field: 'valueToday', header: 'Оборот'},
        {field: 'numTradesToday', header: 'Кол сд'},
        {field: 'percentOfFloatTradedToday', header: '% Flt Tr'},
        {field: 'atrDayPercent', header: 'ATR(D)%'},
        {field: 'atrM60Percent', header: 'ATR(M60)%'},
        {field: 'atrM5Percent', header: 'ATR(M5)%'},
        {field: 'distancePassedSinceLastDayCloseRelativeToAtrAvg', header: 'GAtrDis AVG(D)%'},
        {field: 'distancePassedSinceLastDayCloseRelativeToAtr', header: 'GAtrDis (D)%'},
        {field: 'gapDay', header: 'Gap(D)'},
        {field: 'gapDayPercent', header: 'Gap(D)%'},
        {field: 'volumeM60Percent', header: 'Vol(M60)%'},
        {field: 'volumeM5Percent', header: 'Vol(M5)%'},
        {field: 'volumeToday', header: 'Vol Today'},
        {field: 'relativeVolumeDay', header: 'Rel Vol(D)'},
        {field: 'signals', header: 'Signals'}
    ]

    const lessColumns = [
        {field: 'type', header: 'Type'},
        {field: 'shortName', header: 'Наз'},
        {field: 'lastChange', header: '% изм'},
        {field: 'lastTradePrice', header: 'Цен посл'},
        {field: 'totalDemand', header: 'Об спр/пред'},
        {field: 'distancePassedSinceLastDayCloseRelativeToAtrAvg', header: 'GAtrDis AVG(D)%'},
        {field: 'distancePassedSinceLastDayCloseRelativeToAtr', header: 'GAtrDis (D)%'}
    ]

    useEffect(() => {

        getLastSecurities().then(securities => {
            setSecurities(securities)
            onLastTimeUpdate(new Date())
        })

        const lastSecuritiesSubscription = WebsocketService.getInstance()
            .on<SecurityLastInfo[]>(WSEvent.LAST_SECURITIES)
            .subscribe(securities => {
                setSecurities(securities)
                onLastTimeUpdate(new Date())
            })

        // Specify how to clean up after this effect:
        return function cleanup() {
            lastSecuritiesSubscription.unsubscribe()
        }
    }, [])

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
        const totalDemand: number = rowData.totalDemand
        const totalSupply: number = rowData.totalSupply
        const sum = totalDemand + totalSupply
        const demandWidth = totalDemand * 100 / sum
        const supplyWidth = 100 - demandWidth
        const ratio = round100(totalDemand / totalSupply)

        return (
            <div className="demand-supply" title={`Общ спрос: ${totalDemand} / Общ предл: ${totalSupply} = ${ratio}`}>
                <div className="demand" style={{width: demandWidth + '%'}}></div>
                <div className="supply" style={{width: supplyWidth + '%'}}></div>
            </div>
        )
    }

    const demandSupplySort = (e: any) => {
        if (e.order > 0) {
            return securities.sort((a, b) => a.totalDemand / a.totalSupply - b.totalDemand / b.totalSupply)
        }
        return securities.sort((a, b) => b.totalDemand / b.totalSupply - a.totalDemand / a.totalSupply)
    }

    const selectedColumns = selectedSecurity ? lessColumns : columns
    const columnComponents = selectedColumns.map(col => {
        if ("totalDemand" === col.field) {
            return <Column key={col.field} field={col.field} header={col.header} sortable={true}
                           body={demandSupplyTemplate} sortFunction={demandSupplySort}
                           style={{width: '100px'}}/>
        } else if ("signals" === col.field) {
            return <Column key={col.field} field={col.field} header={col.header} body={signalsTemplate}
                           style={{width: '300px'}}/>
        } else if ("valueToday" === col.field) {
            return <Column key={col.field} field={col.field} header={col.header} sortable={true} filter={true}
                           style={{width: '105px'}}/>
        } else if ("volumeToday" === col.field) {
            return <Column key={col.field} field={col.field} header={col.header} sortable={true} filter={true}
                           style={{width: '105px'}}/>
        } else if ("secCode" === col.field) {
            return <Column key={col.field} field={col.field} header={col.header} sortable={true} filter={true}
                           body={(rowData, column) => <div style={{overflowX: "hidden", fontWeight: SecurityType.STOCK !== rowData.type ? 'bold' : 'normal'}}>{rowData.secCode}</div>}/>
        } else if ("shortName" === col.field) {
            return <Column key={col.field} field={col.field} header={col.header} sortable={true} filter={true}
                           style={{overflowX: "hidden"}}
                           body={(rowData, column) => <div style={{width: '105px', fontWeight: SecurityType.FUTURE === rowData.type ? 'bold' : 'normal'}}>{rowData.shortName}</div>}/>
        } else if ("type" === col.field) {
            return <Column key={col.field} field={col.field} header={col.header} sortable={true} filter={true}
                           style={{width: '30px'}}
                           body={(rowData, column) => <div style={{overflowX: "hidden", fontWeight: SecurityType.CURRENCY === rowData.type ? 'bold' : 'normal'}}>{rowData.type}</div>}/>
        } else {
            return <Column key={col.field} field={col.field} header={col.header} sortable={true} filter={true}/>
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
                       scrollHeight="400px">
                {columnComponents}
            </DataTable>
        </>
    )
}