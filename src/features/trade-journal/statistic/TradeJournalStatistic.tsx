import * as React from "react";
import {useEffect, useState} from "react";
import "./TradeJournalStatistic.css";
import {ClassCode} from "../../../data/ClassCode";
import {ResultDto} from "../../../api/tradejournal/dto/ResultDto";
import moment = require("moment");

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

    if (!stat) {
        return (
            <div className="p-grid">
                <div className="p-col-12 trade-journal-statistic-head">Statistics</div>
            </div>
        );
    }

    return (
        <div className="p-grid">
            <div className="p-col-12 trade-journal-statistic-head">Statistics</div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-3">Total gain/loss:</div>
                    <div className="p-col-3">{stat.totalGainAndLoss}</div>
                    <div className="p-col-3">Largest gain:</div>
                    <div className="p-col-3">{}</div>
                </div>
            </div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-3">Average daily gain/loss:</div>
                    <div className="p-col-3">{}</div>
                    <div className="p-col-3">Largest loss:</div>
                    <div className="p-col-3">{}</div>
                </div>
            </div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-3">Average daily volume:</div>
                    <div className="p-col-3">{}</div>
                    <div className="p-col-3">Average per-share gain/loss:</div>
                    <div className="p-col-3">{}</div>
                </div>
            </div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-3">Average winning trade:</div>
                    <div className="p-col-3">{}</div>
                    <div className="p-col-3">Average trade gain/loss:</div>
                    <div className="p-col-3">{}</div>
                </div>
            </div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-3">Average losing trade:</div>
                    <div className="p-col-3">{}</div>
                    <div className="p-col-3">Trade P&L standard deviation:</div>
                    <div className="p-col-3">{}</div>
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
                    <div className="p-col-3">{}</div>
                </div>
            </div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-3">Number of winning trades:</div>
                    <div className="p-col-3">{stat.winTrades}</div>
                    <div className="p-col-3">Average hold time (winning trades):</div>
                    <div className="p-col-3">{}</div>
                </div>
            </div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-3">Number of losing trades:</div>
                    <div className="p-col-3">{stat.lossTrades}</div>
                    <div className="p-col-3">Average hold time (losing trades):</div>
                    <div className="p-col-3">{}</div>
                </div>
            </div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-3">Number of scratch trades:</div>
                    <div className="p-col-3">{}</div>
                    <div className="p-col-3">Average hold time (scratch trades):</div>
                    <div className="p-col-3">{}</div>
                </div>
            </div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-3">Max consecutive wins:</div>
                    <div className="p-col-3">{}</div>
                    <div className="p-col-3">Max consecutive losses:</div>
                    <div className="p-col-3">{}</div>
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
                    <div className="p-col-3">{}</div>
                    <div className="p-col-3">Total fees:</div>
                    <div className="p-col-3">{}</div>
                </div>
            </div>
        </div>
    )
};
