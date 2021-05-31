import { TabPanel, TabView } from "primereact/tabview";
import * as React from "react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import strategiesApi from "../../app/strategies/strategiesApi";
import { loadStrategiesHistory, loadStrategiesSecurities, loadStrategiesStopped, selectStrategies, setRunning } from "../../app/strategies/strategiesSlice";
import { WebsocketService, WSEvent } from "../../common/api/WebsocketService";
import { EconomicCalendar } from "../../common/components/economic-calendar/EconomicCalendar";
import { MarketBotFilterDataDto } from "../../common/data/bot/MarketBotFilterDataDto";
import { MarketBotStartDto } from "../../common/data/bot/MarketBotStartDto";
import { TradingStrategyResult } from "../../common/data/history/TradingStrategyResult";
import { SecurityLastInfo } from "../../common/data/security/SecurityLastInfo";
import { TradeSystemType } from "../../common/data/trading/TradeSystemType";
import { TradingStrategyStatus } from "../../common/data/trading/TradingStrategyStatus";
import { adjustTradingStrategyResultArray } from "../../common/utils/DataUtils";
import ProfitLossChart from "../trade-journal/profitLossChart/ProfitLossChart";
import { TradeJournalStatistic } from "../trade-journal/statistic/TradeJournalStatistic";
import { TradeJournalTable } from "../trade-journal/table/TradeJournalTable";
import { BotControlAnalysis } from "./analysis/BotControlAnalysis";
import { BotControlAnalysisInfo } from "./analysis/BotControlAnalysisInfo";
import "./BotControlPage.css";
import BotControlFilter from "./filter/BotControlFilter";
import { BotState } from "./running-strategy/bot-state/BotState";
import { RunningStrategyTable } from "./running-strategy/table/RunningStrategyTable";
import { HistoryStrategyResultTable } from "./table/HistoryStrategyResultTable";

type Props = {}

export const BotControlPage: React.FC<Props> = ({ }) => {

    const dispatch = useAppDispatch();
    const { strategyResultsRunning, strategyResultsStopped, strategyResultsHistory } = useAppSelector(selectStrategies);
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

    useEffect(() => {
        strategiesApi.getFilterData(false)
            .then(setFilterData);
        dispatch(loadStrategiesSecurities());
        dispatch(loadStrategiesStopped({ page: 0, size: 1 }));
        dispatch(loadStrategiesHistory({ page: 0, size: 1 }));
    }, [])

    useEffect(() => {
        const selectedTsId = selectedTSResult?.tradingStrategyData?.id;

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
                const running = adjustTradingStrategyResultArray(data)
                    .sort((a, b) => b.tradingStrategyData.id - a.tradingStrategyData.id);

                setRunning(running);

                if (selectedTsId) {
                    const result = running.find(({ tradingStrategyData }) => tradingStrategyData.id === selectedTsId);
                    if (result) setSelectedTSResult(result);
                }
            })

        // Specify how to clean up after this effect:
        return function cleanup() {
            if (wsStatusSub) wsStatusSub.unsubscribe()
            if (tradingStrategiesStatesSubscription) tradingStrategiesStatesSubscription.unsubscribe()
        }
    }, [selectedTSResult?.tradingStrategyData?.id])

    const tabSelected = (index: number): void => {
        setActiveIndex(index)
    }

    const onStart = (data: MarketBotStartDto): void => {
        if (data.systemType === TradeSystemType.HISTORY) {
            strategiesApi.runHistory(data)
                .then(onStrategyResultSelected)
                .catch(console.error)
        } else {
            strategiesApi.startBot(data).then(value => {
                console.log(data, value);
            }).catch(console.error)
        }
    }

    const onSearch = (data: MarketBotStartDto): void => {
        strategiesApi.search(data)
            .then(onStrategyResultSelected)
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

        if (result.tradingStrategyData?.id) {
            strategiesApi.searchByTradingStrategyId(result.tradingStrategyData.id)
                .then(tsResult => {
                    setSelectedTSResult(tsResult)
                    setSelectedSecurity(tsResult.tradePremise?.security)
                })
                .catch(console.error)
        }
    }

    return (
        <div className="p-grid sample-layout BotControlPage">
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
                            <TabPanel header={"Running: " + strategyResultsRunning.totalElements}>
                                <RunningStrategyTable status={TradingStrategyStatus.RUNNING} onSelectedStrategyResult={onStrategyResultSelected} />
                            </TabPanel>
                            <TabPanel header={"Stopped: " + strategyResultsStopped.totalElements}>
                                <RunningStrategyTable status={TradingStrategyStatus.STOPPED} onSelectedStrategyResult={onStrategyResultSelected} />
                            </TabPanel>
                            <TabPanel header={"History: " + strategyResultsHistory.totalElements}>
                                <RunningStrategyTable status={TradingStrategyStatus.FINISHED} onSelectedStrategyResult={onStrategyResultSelected} />
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
