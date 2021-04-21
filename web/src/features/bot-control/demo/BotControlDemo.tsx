import * as React from "react";
import {useEffect} from "react";
import "./MarketState.css";
import {MarketBotStartDto} from "../../../common/data/bot/MarketBotStartDto";

type Props = {
    filter: MarketBotStartDto
};

export const BotControlDemo: React.FC<Props> = ({filter}) => {

    useEffect(() => {
        let alertsSubscription;
        if (filter) {

            // if (filter.fetchByWS) {
            //     alertsSubscription = WebsocketService.getInstance()
            //         .on<MarketStateDto>(filter.history ? WSEvent.HISTORY_MARKET_STATES : WSEvent.MARKET_STATES)
            //         .subscribe(marketState => {
            //             for (const marketStateInterval of marketState.marketStateIntervals) {
            //                 for (const item of marketStateInterval.items) {
            //                     item.candle.timestamp = new Date(item.candle.timestamp);
            //                 }
            //             }
            //             setAlertsReceivedFromServer(marketState);
            //         });
            // }
        }

        // Specify how to clean up after this effect:
        return function cleanup() {
            if (alertsSubscription) alertsSubscription.unsubscribe();
        };
    }, [filter]);

    if (!filter) {
        return (<>Filter for Demo is not set.</>);
    }

    return (
        <div className="p-grid bot-control-demo">

        </div>
    )
};