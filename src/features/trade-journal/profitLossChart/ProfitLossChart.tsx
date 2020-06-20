import * as React from "react";
import {useEffect, useState} from "react";
import {Chart} from "primereact/chart";
import {ResultDto} from "../../../common/data/journal/ResultDto";
import moment = require("moment");

type Props = {
    stat: ResultDto
};
let data = null;

const ProfitLossChart: React.FC<Props> = ({stat}) => {

    const [titleFirstRow, setTitleFirstRow] = useState(null);
    const [titleSecondRow, setTitleSecondRow] = useState(null);
    const [data, setData] = useState(null);

    useEffect(() => {
        updateData(stat);
    }, [stat]);

    const timeDuration = (seconds: number): any => {
        return seconds ? moment.duration(seconds, 'seconds').humanize() : '-';
    };

    const updateData = (result: ResultDto) => {
        let color = '#42A5F5';
        const labelData = result.trades
            .map(trade => {
                const dates = trade.trades
                    .map(trade => trade.dateTime)
                    .sort((a, b) => {
                        return new Date(a).getTime() - new Date(b).getTime();
                    });

                return {
                    date: dates[dates.length - 1],
                    total: trade.totalGainAndLoss
                };
            })
            .sort((a, b) => {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            })
            .map(obj => {
                return {
                    label: moment(obj.date).format("DD-MM HH:mm"),
                    data: obj.total
                }
            });

        const totalTrades = result.trades.length;
        let wins = 0;
        let winsSum = 0;
        let lossSum = 0;
        result.trades.forEach(value => {
            if (value.totalGainAndLoss > 0) {
                wins++;
                winsSum += value.totalGainAndLoss;
            } else {
                lossSum -= value.totalGainAndLoss;
            }
        });

        let winPercentage = wins * 100 / totalTrades;
        winPercentage = Math.round(winPercentage * 100) / 100;

        let lossPercentage = 100 - winPercentage;
        let losses = totalTrades - wins;
        let averageWin = winsSum / wins;
        let averageLoss = lossSum / losses;
        let expectancy = (wins / totalTrades * averageWin) - (losses / totalTrades * averageLoss);
        expectancy = Math.round(expectancy * 100) / 100;

        let profitLossRatio = averageWin / averageLoss;
        profitLossRatio = Math.round(profitLossRatio * 100) / 100;

        averageWin = Math.round(averageWin * 100) / 100;
        averageLoss = Math.round(averageLoss * 100) / 100;

        const newTitleFirstRow = '<strong>Total P/L:</strong> ' + result.totalGainAndLoss
            + ', <strong>Profit Factor:</strong> ' + result.profitFactor
            + ', <strong>Win %:</strong> ' + winPercentage
            + '%, <strong>Expect.:</strong> ' + expectancy
            + ', <strong>P/L ratio:</strong> ' + profitLossRatio
            + ', <strong>Avg Win:</strong> ' + averageWin
            + ', <strong>Avg Loss:</strong> ' + averageLoss;

        const newTitleSecondRow = '<strong>Largest Gain:</strong> ' + result.largestGain
            + ', <strong>Largest Loss:</strong> ' + result.largestLoss
            + ', <strong>Max Con. Wins:</strong> ' + result.maxConsecutiveWins
            + ', <strong>Max Con. Losses:</strong> ' + result.maxConsecutiveLosses
            + ', <strong>Avg hold time (Win):</strong> ' + timeDuration(result.avgHoldTimeWinTradesSeconds)
            + ', <strong>Avg hold time (Los):</strong> ' + timeDuration(result.avgHoldTimeLossTradesSeconds);

        setTitleFirstRow(newTitleFirstRow);
        setTitleSecondRow(newTitleSecondRow);
        setData({
            labels: labelData.map(value => value.label),
            datasets: [{
                label: 'P/L',
                data: labelData.map(value => value.data),
                fill: false,
                backgroundColor: color,
                borderColor: color
            }]
        });
    };

    if (data) {
        return (
            <>
                {titleFirstRow ?
                    <>
                        <div style={{textAlign: "center"}}
                             dangerouslySetInnerHTML={{__html: titleFirstRow}}></div>
                        <div style={{textAlign: "center"}}
                             dangerouslySetInnerHTML={{__html: titleSecondRow}}></div>
                    </>
                    : null}
                <Chart type="bar"
                       data={data}
                       width={'1200px'}
                       height={'300px'} style={{marginLeft: "auto", marginRight: "auto"}}/>
            </>
        )
    } else {
        return (
            <div>ProfitLossChart needs data</div>
        )
    }
};

export default ProfitLossChart;