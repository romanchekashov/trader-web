import * as React from "react";
import { useEffect, useState } from "react";
import { MarketBotFilterDataDto } from "../../common/data/bot/MarketBotFilterDataDto";
import BotControlFilter from "./filter/BotControlFilter";
import { MarketBotStartDto } from "../../common/data/bot/MarketBotStartDto";
import strategiesApi from "../../app/strategies/strategiesApi";
import { TradingStrategyResult } from "../../common/data/history/TradingStrategyResult";
import { HistoryStrategyResultTable } from "./table/HistoryStrategyResultTable";
import { TradeSystemType } from "../../common/data/trading/TradeSystemType";
import ProfitLossChart from "../trade-journal/profitLossChart/ProfitLossChart";
import { TradeJournalStatistic } from "../trade-journal/statistic/TradeJournalStatistic";
import { TradeJournalTable } from "../trade-journal/table/TradeJournalTable";
import { BotControlLastInfo } from "./last-info/BotControlLastInfo";
import { TabPanel, TabView } from "primereact/tabview";
import { BotControlAnalysis } from "./analysis/BotControlAnalysis";
import { getSecurity } from "../../common/utils/Cache";
import { BotControlAnalysisInfo } from "./analysis/BotControlAnalysisInfo";
import { RunningStrategy } from "./running-strategy/RunningStrategy";
import { EconomicCalendar } from "../../common/components/economic-calendar/EconomicCalendar";
import { WebsocketService, WSEvent } from "../../common/api/WebsocketService";
import { adjustTradingStrategyResultArray } from "../../common/utils/DataUtils";
import { TradingStrategyStatus } from "../../common/data/trading/TradingStrategyStatus";
import { SecurityLastInfo } from "../../common/data/security/SecurityLastInfo";
import { BotState } from "./running-strategy/bot-state/BotState";
import { loadStrategies, loadStrategiesHistory, selectStrategies } from "../../app/strategies/strategiesSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

type Props = {}

export const BotControlPage: React.FC<Props> = ({ }) => {

    const dispatch = useAppDispatch();
    const { strategyResultsHistory, strategyResults } = useAppSelector(selectStrategies);
    const items = [
        { label: 'Current State', icon: 'pi pi-fw pi-home' },
        { label: 'Real Deposit Stats', icon: 'pi pi-fw pi-calendar' },
        { label: 'Demo Deposit Stats', icon: 'pi pi-fw pi-pencil' },
        { label: 'History Stats', icon: 'pi pi-fw pi-file' }
    ]

    const [filterData, setFilterData] = useState<MarketBotFilterDataDto>(null)
    const [activeItem, setActiveItem] = useState<any>(items[0])
    const [activeIndex, setActiveIndex] = useState<number>(0)
    const [selectedSecurity, setSelectedSecurity] = useState<SecurityLastInfo>(null)
    const [selectedTSResult, setSelectedTSResult] = useState<TradingStrategyResult>(null)
    const [nonRunning, setNonRunning] = useState<TradingStrategyResult[]>([])
    const [running, setRunning] = useState<TradingStrategyResult[]>([])
    const [selectedTsId, setSelectedTsId] = useState<number>(null)

    useEffect(() => {
        strategiesApi.getFilterData(false)
            .then(setFilterData);
        dispatch(loadStrategiesHistory({ page: 0, size: 1 }));
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

    const tabSelected = (index: number): void => {
        setActiveIndex(index)
    }

    const onStart = (data: MarketBotStartDto): void => {
        if (data.systemType === TradeSystemType.HISTORY) {
            strategiesApi.runHistory(data)
                .then(setSelectedTSResult)
                .catch(console.error)
        } else {
            strategiesApi.startBot(data).then(value => {
                console.log(data, value);
            }).catch(console.error)
        }
    }

    const onSearch = (data: MarketBotStartDto): void => {
        strategiesApi.search(data)
            .then(setSelectedTSResult)
            .catch(console.error)
    }

    const onStopHistory = (data: MarketBotStartDto): void => {
        if (data.systemType === TradeSystemType.HISTORY) {
            strategiesApi.stopHistory(data)
                .then(value => {
                    console.log(data, value)
                })
                .catch(console.error)
        }
    }

    const onStrategyResultSelected = (result: TradingStrategyResult): void => {
        setSelectedTSResult(result)
        setSelectedSecurity(result.tradePremise?.security)

        if (result.tradingStrategyData.id) {
            strategiesApi.searchByTradingStrategyId(result.tradingStrategyData.id)
                .then(tsResult => {
                    setSelectedTSResult(tsResult)
                    setSelectedSecurity(tsResult.tradePremise?.security)
                })
                .catch(console.error)
        }
    }

    return (
        <div className="p-grid sample-layout">
            <div className="p-col-12">
                <BotControlFilter filter={filterData}
                    onStart={onStart}
                    onSearch={onSearch}
                    onStopHistory={onStopHistory} />
            </div>

            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-6">
                        <TabView onTabChange={e => tabSelected(e.index)} activeIndex={activeIndex}>
                            <TabPanel header={"Running: " + strategyResults.totalElements}>
                                <RunningStrategy
                                    results={running}
                                    onStrategyResultSelected={onStrategyResultSelected} />
                            </TabPanel>
                            <TabPanel header={"History: " + strategyResultsHistory.totalElements}>
                                <BotControlLastInfo
                                    results={nonRunning}
                                    outerHeight={400}
                                    onStrategyResultSelected={onStrategyResultSelected} />
                            </TabPanel>
                        </TabView>
                    </div>
                    <div className="p-col-6">
                        {selectedTSResult ? <>
                            <BotState tradingStrategyResult={selectedTSResult} />
                            <BotControlAnalysis security={selectedSecurity}
                                tradingStrategyResult={selectedTSResult} />
                        </> : null}

                    </div>
                </div>
            </div>

            <div className="p-col-12" style={{ padding: 0 }}>
                <TabView>
                    <TabPanel header="Trades">
                        <TradeJournalTable stat={selectedTSResult?.stat} />
                    </TabPanel>
                    <TabPanel header="Strategy Stat">
                        <HistoryStrategyResultTable stat={selectedTSResult} />
                    </TabPanel>
                    <TabPanel header="Profit Loss Stat">
                        <div className="p-col-12">
                            <ProfitLossChart stat={selectedTSResult?.stat} />
                        </div>
                        <div className="p-col-12">
                            <TradeJournalStatistic stat={selectedTSResult?.stat} />
                        </div>
                    </TabPanel>
                    <TabPanel header="Info">
                        <BotControlAnalysisInfo security={selectedSecurity} />
                    </TabPanel>
                    <TabPanel header="Calendar">
                        <EconomicCalendar secId={selectedSecurity?.id} />
                    </TabPanel>
                </TabView>
            </div>
        </div>
    )
}
