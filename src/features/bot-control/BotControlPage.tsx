import * as React from "react";
import {useEffect, useState} from "react";
import {MarketBotFilterDataDto} from "../../common/data/bot/MarketBotFilterDataDto";
import BotControlFilter from "./filter/BotControlFilter";
import {MarketBotStartDto} from "../../common/data/bot/MarketBotStartDto";
import {
    getAllStrategies,
    getFilterData,
    runHistory,
    search,
    searchByTradingStrategyId,
    startBot,
    stopHistory
} from "../../common/api/rest/botControlRestApi";
import {TradingStrategyResult} from "../../common/data/history/TradingStrategyResult";
import {HistoryStrategyResultTable} from "./table/HistoryStrategyResultTable";
import {TradeSystemType} from "../../common/data/trading/TradeSystemType";
import ProfitLossChart from "../trade-journal/profitLossChart/ProfitLossChart";
import {TradeJournalStatistic} from "../trade-journal/statistic/TradeJournalStatistic";
import {TradeJournalTable} from "../trade-journal/table/TradeJournalTable";
import {BotControlLastInfo} from "./last-info/BotControlLastInfo";
import {TabPanel, TabView} from "primereact/tabview";
import {BotControlAnalysis} from "./analysis/BotControlAnalysis";
import {getSecurity} from "../../common/utils/Cache";
import {BotControlAnalysisInfo} from "./analysis/BotControlAnalysisInfo";
import {RunningStrategy} from "./running-strategy/RunningStrategy";
import {EconomicCalendar} from "../../common/components/economic-calendar/EconomicCalendar";
import {WebsocketService, WSEvent} from "../../common/api/WebsocketService";
import {adjustTradingStrategyResultArray} from "../../common/utils/DataUtils";
import {TradingStrategyStatus} from "../../common/data/trading/TradingStrategyStatus";

type Props = {}

export const BotControlPage: React.FC<Props> = ({}) => {

    const items = [
        {label: 'Current State', icon: 'pi pi-fw pi-home'},
        {label: 'Real Deposit Stats', icon: 'pi pi-fw pi-calendar'},
        {label: 'Demo Deposit Stats', icon: 'pi pi-fw pi-pencil'},
        {label: 'History Stats', icon: 'pi pi-fw pi-file'}
    ]

    const [filterData, setFilterData] = useState<MarketBotFilterDataDto>(null)
    const [activeItem, setActiveItem] = useState<any>(items[0])
    const [selectedSecurity, setSelectedSecurity] = useState<any>(null)
    const [selectedTSResult, setSelectedTSResult] = useState<any>(null)
    const [nonRunning, setNonRunning] = useState<TradingStrategyResult[]>([])
    const [running, setRunning] = useState<TradingStrategyResult[]>([])
    const [selectedTsId, setSelectedTsId] = useState<number>(null)

    useEffect(() => {
        getFilterData(false)
            .then(setFilterData)

        getAllStrategies()
            .then(results => {
                setNonRunning(results
                    .filter(value => value.tradingStrategyData.status !== TradingStrategyStatus.RUNNING)
                    .sort((a, b) => b.tradingStrategyData.id - a.tradingStrategyData.id))
            })
            .catch(console.error)
    }, [])

    useEffect(() => {
        const wsStatusSub = WebsocketService.getInstance()
            .connectionStatus()
            .subscribe(isConnected => {
                if (isConnected) {
                    // informServerAboutRequiredData();
                }
            })

        const tradingStrategiesStatesSubscription = WebsocketService.getInstance()
            .on<TradingStrategyResult[]>(WSEvent.TRADING_STRATEGIES_RESULTS)
            .subscribe(data => {
                const newResults: TradingStrategyResult[] = adjustTradingStrategyResultArray(data)
                    .sort((a, b) => b.tradingStrategyData.id - a.tradingStrategyData.id)
                setRunning(newResults)
                if (selectedTsId) setSelectedTSResult(newResults
                    .find(value => value.tradingStrategyData.id === selectedTsId))
            })

        // Specify how to clean up after this effect:
        return function cleanup() {
            if (wsStatusSub) wsStatusSub.unsubscribe()
            if (tradingStrategiesStatesSubscription) tradingStrategiesStatesSubscription.unsubscribe()
        }
    }, [selectedTsId])

    const onStart = (data: MarketBotStartDto): void => {
        if (data.systemType === TradeSystemType.HISTORY) {
            runHistory(data)
                .then(setSelectedTSResult)
                .catch(console.error)
        } else {
            startBot(data).then(value => {
                console.log(data, value);
            }).catch(console.error)
        }
    }

    const onSearch = (data: MarketBotStartDto): void => {
        search(data)
            .then(setSelectedTSResult)
            .catch(console.error)
    }

    const onStopHistory = (data: MarketBotStartDto): void => {
        if (data.systemType === TradeSystemType.HISTORY) {
            stopHistory(data)
                .then(value => {
                    console.log(data, value)
                })
                .catch(console.error)
        }
    }

    const onStrategyResultSelected = (result: TradingStrategyResult): void => {
        setSelectedTSResult(result)
        setSelectedSecurity(getSecurity(result.tradingStrategyData.security.classCode,
            result.tradingStrategyData.security.secCode))

        if (result.tradingStrategyData.id) {
            searchByTradingStrategyId(result.tradingStrategyData.id)
                .then(setSelectedTSResult)
                .catch(console.error)
        }
    }

    return (
        <div className="p-grid sample-layout">
            <div className="p-col-12">
                <BotControlFilter filter={filterData}
                                  onStart={onStart}
                                  onSearch={onSearch}
                                  onStopHistory={onStopHistory}/>
            </div>

            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-6">
                        <TabView>
                            <TabPanel header={"Running: " + running.length}>
                                <RunningStrategy
                                    results={running}
                                    onStrategyResultSelected={onStrategyResultSelected}/>
                            </TabPanel>
                            <TabPanel header={"History: " + nonRunning.length}>
                                <BotControlLastInfo
                                    results={nonRunning}
                                    outerHeight={400}
                                    onStrategyResultSelected={onStrategyResultSelected}/>
                            </TabPanel>
                        </TabView>
                    </div>
                    <div className="p-col-6">
                        <BotControlAnalysis security={selectedSecurity}
                                            tradingStrategyResult={selectedTSResult}/>
                    </div>
                </div>
            </div>

            <div className="p-col-12" style={{padding: 0}}>
                <TabView>
                    <TabPanel header="Trades">
                        <TradeJournalTable stat={selectedTSResult?.stat}/>
                    </TabPanel>
                    <TabPanel header="Strategy Stat">
                        <HistoryStrategyResultTable stat={selectedTSResult}/>
                    </TabPanel>
                    <TabPanel header="Profit Loss Stat">
                        <div className="p-col-12">
                            <ProfitLossChart stat={selectedTSResult?.stat}/>
                        </div>
                        <div className="p-col-12">
                            <TradeJournalStatistic stat={selectedTSResult?.stat}/>
                        </div>
                    </TabPanel>
                    <TabPanel header="Info">
                        <BotControlAnalysisInfo security={selectedSecurity}/>
                    </TabPanel>
                    <TabPanel header="Calendar">
                        <EconomicCalendar secId={selectedSecurity?.id}/>
                    </TabPanel>
                </TabView>
            </div>
        </div>
    )
}
