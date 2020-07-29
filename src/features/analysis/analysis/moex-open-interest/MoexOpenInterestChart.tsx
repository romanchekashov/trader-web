import * as React from "react";
import {useEffect, useState} from "react";
import {Chart} from "primereact/chart";
import {ClientGroup} from "../../../../common/data/open-interest/ClientGroup";
import {MoexOpenInterest} from "../../../../common/data/open-interest/MoexOpenInterest";
import moment = require("moment");

type Props = {
    moexOpenInterests: MoexOpenInterest[]
    dateTimeFormat: string
    title: string
    width: number
    height: number
};

export const MoexOpenInterestChart: React.FC<Props> = ({moexOpenInterests, dateTimeFormat,
                                                           title, width, height}) => {

    if (!moexOpenInterests || moexOpenInterests.length == 0) return null

    const fizLongColor = '#4caf50'
    const fizShortColor = "#f44336"
    const yurLongColor = "#1a237e"
    const yurShortColor = "#870000"

    const options = {
        title: {
            display: true,
            text: title,
            fontSize: 16
        },
        legend: {
            position: 'bottom'
        }
    }
    const [data, setData] = useState(null);

    useEffect(() => {
        setData({
            labels: moexOpenInterests
                .map(value => moment(value.dateTime).format(dateTimeFormat)),
            datasets: [
                {
                    label: ClientGroup.FIZ + " LONG",
                    data: moexOpenInterests.map(value => value.fizPosLong),
                    fill: false,
                    backgroundColor: fizLongColor,
                    borderColor: fizLongColor
                },
                {
                    label: ClientGroup.FIZ + " SHORT",
                    data: moexOpenInterests.map(value => value.fizPosShort),
                    fill: false,
                    backgroundColor: fizShortColor,
                    borderColor: fizShortColor
                },
                {
                    label: ClientGroup.YUR + " LONG",
                    data: moexOpenInterests.map(value => value.yurPosLong),
                    fill: false,
                    backgroundColor: yurLongColor,
                    borderColor: yurLongColor
                },
                {
                    label: ClientGroup.YUR + " SHORT",
                    data: moexOpenInterests.map(value => value.yurPosShort),
                    fill: false,
                    backgroundColor: yurShortColor,
                    borderColor: yurShortColor
                }
            ]
        })
    }, [moexOpenInterests])

    return (
        <>
            <Chart type="line"
                   data={data}
                   options={options}
                   width={`${width}px`}
                   height={`${height}px`}/>
        </>
    )
};