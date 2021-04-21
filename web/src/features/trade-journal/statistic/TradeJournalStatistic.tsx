import * as React from "react";
import {useEffect, useState} from "react";
import "./TradeJournalStatistic.css";
import {ClassCode} from "../../../common/data/ClassCode";
import {ResultDto} from "../../../common/data/journal/ResultDto";
import moment = require("moment");
import {round100} from "../../../common/utils/utils";

export interface TradeJournalStatisticState {
    start: Date
    end: Date
}

type Props = {
    stat: ResultDto
};

export const TradeJournalStatistic: React.FC<Props> = ({stat}) => {
    let initState: TradeJournalStatisticState = {
        start: moment().hours(19).minutes(0).seconds(0).toDate(),
        end: moment().hours(19).minutes(0).seconds(0).toDate()
    };

    const classCodes = [ClassCode.SPBFUT, ClassCode.TQBR, ClassCode.CETS];

    const [markets, setMarkets] = useState([]);
    const [securities, setSecurities] = useState([]);
    const [start, setStart] = useState(initState.start);
    const [end, setEnd] = useState(initState.end);

    useEffect(() => {
    }, []);

    const timeDuration = (seconds: number): any => {
        return seconds ? moment.duration(seconds, 'seconds').humanize() : '-';
    };

    const winTrades = (): string => {
        const winPercentage = round100(stat.winTrades * 100 / stat.totalTrades);
        return `${stat.winTrades} (${winPercentage}%)`;
    };

    const lossTrades = (): string => {
        const lossPercentage = round100(stat.lossTrades * 100 / stat.totalTrades);
        return `${stat.lossTrades} (${lossPercentage}%)`;
    };

    if (!stat) {
        return (
            <div className="p-grid">
                <div className="p-col-12">No data</div>
            </div>
        );
    }

    return (
        <div className="p-grid tj_stat">
            <div className="p-col-12 trade-journal-statistic-head">Statistics</div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-3">Total gain/loss:</div>
                    <div className="p-col-3">{stat.totalGainAndLoss}</div>
                    <div className="p-col-3">Largest gain:</div>
                    <div className="p-col-3">{stat.largestGain}</div>
                </div>
            </div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-3">Average daily gain/loss:</div>
                    <div className="p-col-3">{stat.avgDailyGainAndLoss}</div>
                    <div className="p-col-3">Largest loss:</div>
                    <div className="p-col-3">{stat.largestLoss}</div>
                </div>
            </div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-3">Average daily volume:</div>
                    <div className="p-col-3">{stat.avgDailyVolume}</div>
                    <div className="p-col-3">Average per-share gain/loss:</div>
                    <div className="p-col-3">{stat.avgPerShareGainAndLoss}</div>
                </div>
            </div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-3">Average win trade quantity:</div>
                    <div className="p-col-3">{stat.avgWinTradeQuantity}</div>
                    <div className="p-col-3">Average loss trade quantity:</div>
                    <div className="p-col-3">{stat.avgLossTradeQuantity}</div>
                </div>
            </div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-3">Average winning trade:</div>
                    <div className="p-col-3">{stat.avgWinTrade}</div>
                    <div className="p-col-3">Average trade gain/loss:</div>
                    <div className="p-col-3">{stat.avgTradeGainAndLoss}</div>
                </div>
            </div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-3">Average losing trade:</div>
                    <div className="p-col-3">{stat.avgLossTrade}</div>
                    <div className="p-col-3">Trade P&L standard deviation:</div>
                    <div className="p-col-3">{stat.tradeProfitAndLossStdDeviation}</div>
                </div>
            </div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-3">System Quality Number (SQN):</div>
                    <div className="p-col-3">{}</div>
                    <div className="p-col-3">Probability of random chance:</div>
                    <div className="p-col-3">{}</div>
                </div>
            </div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-3">Total number of trades:</div>
                    <div className="p-col-3">{stat.totalTrades}</div>
                    <div className="p-col-3">Profit factor:</div>
                    <div className="p-col-3">{stat.profitFactor}</div>
                </div>
            </div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-3">Number of winning trades:</div>
                    <div className="p-col-3">{winTrades()}</div>
                    <div className="p-col-3">Average hold time (winning trades):</div>
                    <div className="p-col-3">{timeDuration(stat.avgHoldTimeWinTradesSeconds)}</div>
                </div>
            </div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-3">Number of losing trades:</div>
                    <div className="p-col-3">{lossTrades()}</div>
                    <div className="p-col-3">Average hold time (losing trades):</div>
                    <div className="p-col-3">{timeDuration(stat.avgHoldTimeLossTradesSeconds)}</div>
                </div>
            </div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-3">Number of scratch trades:</div>
                    <div className="p-col-3">{stat.scratchTrades}</div>
                    <div className="p-col-3">Average hold time (scratch trades):</div>
                    <div className="p-col-3">{timeDuration(stat.avgHoldTimeScratchTradesSeconds)}</div>
                </div>
            </div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-3">Max consecutive wins:</div>
                    <div className="p-col-3">{stat.maxConsecutiveWins}</div>
                    <div className="p-col-3">Max consecutive losses:</div>
                    <div className="p-col-3">{stat.maxConsecutiveLosses}</div>
                </div>
            </div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-3">Average position MFE:</div>
                    <div className="p-col-3">{}</div>
                    <div className="p-col-3">Average position MAE:</div>
                    <div className="p-col-3">{}</div>
                </div>
            </div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-3">Total commissions:</div>
                    <div className="p-col-3">{stat.totalCommissions}</div>
                    <div className="p-col-3">Total fees:</div>
                    <div className="p-col-3">{stat.totalFees}</div>
                </div>
            </div>
        </div>
    )
};
