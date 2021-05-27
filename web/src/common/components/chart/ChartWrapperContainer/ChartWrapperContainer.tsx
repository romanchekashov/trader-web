import moment = require("moment");
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { filter } from "rxjs/internal/operators";
import { selectActiveTrades } from "../../../../app/activeTrades/activeTradesSlice";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { selectOrders } from "../../../../app/orders/ordersSlice";
import { PossibleTrade } from "../../../../app/possibleTrades/data/PossibleTrade";
import { selectPossibleTrade, tradePossibleTrade } from "../../../../app/possibleTrades/possibleTradesSlice";
import { selectSecurities } from "../../../../app/securities/securitiesSlice";
import { createStop, deleteStop, selectStops } from "../../../../app/stops/stopsSlice";
import analysisRestApi from "../../../api/rest/analysisRestApi";
import { WebsocketService, WSEvent } from "../../../api/WebsocketService";
import { BrokerId } from "../../../data/BrokerId";
import { CrudMode } from "../../../data/CrudMode";
import { DataType } from "../../../data/DataType";
import { Interval } from "../../../data/Interval";
import { Market } from "../../../data/Market";
import { OrderType } from "../../../data/OrderType";
import { SecurityLastInfo } from "../../../data/security/SecurityLastInfo";
import { SecurityType } from "../../../data/security/SecurityType";
import { TradePremise } from "../../../data/strategy/TradePremise";
import { TradeStrategyAnalysisFilterDto } from "../../../data/TradeStrategyAnalysisFilterDto";
import { TradingPlatform } from "../../../data/trading/TradingPlatform";
import { adjustTradePremise } from "../../../utils/DataUtils";
import { getRecentBusinessDate } from "../../../utils/utils";
import { ChartWrapper } from "../ChartWrapper";
import { ChartManageOrder } from "../data/ChartManageOrder";

type Props = {
    interval: Interval;
    numberOfCandles?: number;
    width?: number;
    height?: number;
    security: SecurityLastInfo;
    onIntervalChanged?: (interval: Interval) => void;
    onStartChanged?: (start: Date) => void;
    onPremiseBeforeChanged?: (before: Date) => void;
}

const ChartWrapperContainer: React.FC<Props> = ({
    interval,
    numberOfCandles = 200,
    width,
    height,
    security,
    onIntervalChanged,
    onStartChanged,
    onPremiseBeforeChanged,
}) => {
    const dispatch = useAppDispatch();
    const { possibleTrade } = useAppSelector(selectPossibleTrade);
    const { securities } = useAppSelector(selectSecurities);
    const { stops } = useAppSelector(selectStops);
    const { orders } = useAppSelector(selectOrders);
    const { activeTrades } = useAppSelector(selectActiveTrades);

    const ref = useRef(null);

    const securityLastInfo =
        securities?.find((o) => o.id === security.id) || security;

    const activeTrade = activeTrades.find(({ secId }) => secId === security.id);

    const [premise, setPremise] = useState<TradePremise>(null);

    useEffect(() => {
        const tradeStrategyAnalysisFilter = {
            brokerId:
                security?.market === Market.SPB
                    ? BrokerId.TINKOFF_INVEST
                    : BrokerId.ALFA_DIRECT,
            tradingPlatform:
                security?.market === Market.SPB
                    ? TradingPlatform.API
                    : TradingPlatform.QUIK,
            secId: security?.id,
            timeFrameTrading: security?.type === SecurityType.FUTURE ? Interval.M3 : Interval.M60,
            timeFrameMin: security?.type === SecurityType.FUTURE ? Interval.M1 : Interval.M5,
        };

        fetchPremise(tradeStrategyAnalysisFilter);

        const tradePremiseSubscription = WebsocketService.getInstance()
            .on<TradePremise>(WSEvent.TRADE_PREMISE)
            .pipe(filter((premise) => premise.security.id === security?.id))
            .subscribe((newPremise) => {
                adjustTradePremise(newPremise);
                setPremise(newPremise);
            });

        const wsStatusSub = WebsocketService.getInstance()
            .connectionStatus()
            .subscribe((isConnected) => {
                if (isConnected && security) {
                    informServerAboutRequiredData(tradeStrategyAnalysisFilter);
                }
            });

        if (security) {
            informServerAboutRequiredData(tradeStrategyAnalysisFilter);
        }

        // Specify how to clean up after this effect:
        return function cleanup() {
            tradePremiseSubscription.unsubscribe();
            wsStatusSub.unsubscribe();
            WebsocketService.getInstance().send<TradeStrategyAnalysisFilterDto>(
                WSEvent.UNSUBSCRIBE_TRADE_PREMISE_AND_SETUP,
                tradeStrategyAnalysisFilter
            );
        };
    }, [security?.id, interval]);


    const fetchPremise = (
        tradeStrategyAnalysisFilter: TradeStrategyAnalysisFilterDto
    ) => {
        analysisRestApi
            .getTradePremise({
                ...tradeStrategyAnalysisFilter,
                timestamp: getRecentBusinessDate(
                    moment().hours(0).minutes(0).seconds(0).add(1, "days").toDate()
                ),
            })
            .then(setPremise)
            .catch((reason) => {
                console.error(reason);
                fetchPremise(tradeStrategyAnalysisFilter);
            });
    };

    const informServerAboutRequiredData = (
        tradeStrategyAnalysisFilter: TradeStrategyAnalysisFilterDto
    ): void => {
        WebsocketService.getInstance().send<TradeStrategyAnalysisFilterDto>(
            WSEvent.SUBSCRIBE_TRADE_PREMISE_AND_SETUP,
            tradeStrategyAnalysisFilter
        );
    };

    const manageOrder = (order: ChartManageOrder) => {
        console.log("manageOrder: ", order);
        if (order.dataType === DataType.ORDER) {
            if (order.action === CrudMode.DELETE) {
                WebsocketService.getInstance().send(
                    history ? WSEvent.HISTORY_CANCEL_ORDERS : WSEvent.CANCEL_ORDERS,
                    [order.data]
                );
            }
            if (order.action === CrudMode.CREATE) {
                WebsocketService.getInstance().send(
                    history ? WSEvent.HISTORY_CREATE_ORDERS : WSEvent.CREATE_ORDERS,
                    [order.data]
                );
            }
        }

        if (order.dataType === DataType.STOP_ORDER) {
            if (order.action === CrudMode.DELETE)
                dispatch(deleteStop(order.data.number));
            if (order.action === CrudMode.CREATE) dispatch(createStop(order.data));
        }

        if (order.dataType === DataType.POSSIBLE_TRADE) {
            const possibleTrade: PossibleTrade = order.data;
            dispatch(
                tradePossibleTrade({
                    brokerId: BrokerId.ALFA_DIRECT,
                    tradingPlatform: TradingPlatform.QUIK,
                    secId: security.id,
                    timeFrame: possibleTrade.timeFrame,
                    entryPrice: possibleTrade.entryPrice,
                    quantity: possibleTrade.quantity,
                    operation: possibleTrade.operation,
                    depositAmount: 0,
                    depositMaxRiskPerTradeInPercent: 1,
                    orderType: OrderType.MARKET,
                })
            );
        }
    };

    return <div ref={ref}>
        <ChartWrapper
            interval={interval}
            initialNumberOfCandles={numberOfCandles}
            onIntervalChanged={onIntervalChanged}
            onStartChanged={onStartChanged}
            onPremiseBeforeChanged={onPremiseBeforeChanged}
            width={width || ref?.current?.clientWidth || 200}
            chartHeight={height - 22}
            security={securityLastInfo}
            premise={premise}
            stops={stops}
            orders={orders}
            trades={[]}
            activeTrade={activeTrade}
            showGrid={true}
            possibleTrade={possibleTrade}
            onManageOrder={manageOrder}
        />
    </div>;
};

export default ChartWrapperContainer;