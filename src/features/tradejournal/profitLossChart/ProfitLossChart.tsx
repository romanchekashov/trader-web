import * as React from "react";
import {Chart} from "primereact/chart";
import {ResultDto} from "../../../api/tradejournal/dto/ResultDto";
import moment = require("moment");

type Props = {
    stat: ResultDto[]
};
let data = null;

const ProfitLossChart: React.FC<Props> = ({stat}) => {

    const setData = (result: ResultDto[]) => {
        let color = '#42A5F5';
        const labelData = result[0].trades
            .map(trade => {
                const dates = trade.trades.map(trade => trade.dateTime).sort((a, b) => {
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

        const totalTrades = result[0].trades.length;
        let wins = 0;
        let winsSum = 0;
        let lossSum = 0;
        result[0].trades.forEach(value => {
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

        data = {
            labels: labelData.map(value => value.label),
            datasets: [{
                    label: 'P/L ratio: ' + profitLossRatio + ', Win %: ' + winPercentage + '%, Expectancy: ' + expectancy
                        + ', Avg Win: ' + averageWin + ', Avg Loss: ' + averageLoss,
                    data: labelData.map(value => value.data),
                    fill: false,
                    backgroundColor: color,
                    borderColor: color
            }]
        };
    };

    if (stat && stat.length > 0) {
        setData(stat);

        return (
            <>
                <Chart type="bar" data={data} width={'600px'} height={'300px'} />
            </>
        )
    } else {
        return (
            <div>ProfitLossChart needs data</div>
        )
    }
};

export default ProfitLossChart;