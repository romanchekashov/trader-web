import * as React from "react";
import {useEffect, useState} from "react";
import {Chart} from "primereact/chart";
import {ClientGroup} from "../../../common/data/open-interest/ClientGroup";
import {MoexOpenInterest} from "../../../common/data/open-interest/MoexOpenInterest";
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

    const yurColor = '#4caf50'
    const fizColor = '#2196f3'
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
                    label: ClientGroup.YUR,
                    data: moexOpenInterests
                        .map(value => value.yurPosLong - value.yurPosShort),
                    fill: false,
                    backgroundColor: yurColor,
                    borderColor: yurColor
                },
                {
                    label: ClientGroup.FIZ,
                    data: moexOpenInterests
                        .map(value => value.fizPosLong - value.fizPosShort),
                    fill: false,
                    backgroundColor: fizColor,
                    borderColor: fizColor
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