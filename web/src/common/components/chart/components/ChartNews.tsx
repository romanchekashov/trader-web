import * as React from "react";
import { useMemo } from "react";
import { Annotate, buyPath, SvgPathAnnotation, LabelAnnotation } from "react-financial-charts/lib/annotation";
import { useAppSelector } from "../../../../app/hooks";
import { selectEconomicCalendarEvents } from "../../../../app/news/newsSlice";
import { Candle } from "../../../data/Candle";
import { Interval } from "../../../data/Interval";
import { EconomicCalendarEvent } from "../../../data/news/EconomicCalendarEvent";
import { sortEconomicCalendarEventsByVolatility } from "../../../utils/DataUtils";
import { VolatilityColors } from "../../../utils/utils";

const _ = require("lodash");

type Props = {
    candles: Candle[]
};

const ChartNews: React.FC<Props> = ({ candles }) => {
    const { economicCalendarEvents } = useAppSelector(selectEconomicCalendarEvents);

    const DELS = {
        'M1': 1,
        'M3': 3,
        'M5': 5,
        'M10': 10,
        'M15': 15,
        'M30': 30
    }

    const red = '#FF0000'
    const green = '#00FF00'

    const calcResult = useMemo(() => {
        const items = {}
        const secId = "" + candles[0].secId;
        const isDayInterval = candles[0].interval === Interval.DAY;
        const del = DELS[candles[0].interval]

        for (const event of economicCalendarEvents) {
            if (event.tags.some(({keys}) => keys === secId)) {
                const dateTime = new Date(event.dateTime.getTime())
                
                if (del) {
                    let minutes = dateTime.getMinutes()
                    while (minutes % del !== 0) minutes--
                    dateTime.setMinutes(minutes)
                } else {
                    dateTime.setMinutes(0)
                }

                dateTime.setSeconds(0)
                
                if (isDayInterval) dateTime.setHours(0);
    
                if (!items[dateTime.getTime()]) items[dateTime.getTime()] = [];
                
                items[dateTime.getTime()].push(event);
            }
        }

        Object.values(items).forEach(sortEconomicCalendarEventsByVolatility);

        return items;
    }, [economicCalendarEvents, candles.length, candles[0]?.secId, candles[0]?.interval]);

    // const defaultAnnotationProps = {
    //     onClick: ({datum, xScale, yScale}) => {
    //         console.log(calcResult[datum.timestamp.getTime()]);
    //     },
    // }

    // const annotationProps = {
    //     ...defaultAnnotationProps,
    //     y: ({ yScale, datum }) => yScale.range()[0] - 20,
    //     fill: "#006517",
    //     path: buyPath,
    //     tooltip: (d) => {
    //         const { expectedVolatility, title, valuePrevious, valueForecast, valueActual } = calcResult[d.timestamp.getTime()];
    //         return `${title} (Volatility: ${expectedVolatility})\nPrev: ${valuePrevious} / Forecast: ${valueForecast} / Actual: ${valueActual}` 
    //     },
    // };

    const annotationProps = {
        fontFamily: "Roboto",
        fontSize: 20,
        fill: (d) => {
            const { expectedVolatility } = calcResult[d.timestamp.getTime()][0];
            return VolatilityColors[expectedVolatility] || "#060F8F";
        },
        opacity: 1,
        text: "E",
        y: ({ yScale }) => yScale.range()[0],
        onClick: ({datum, xScale, yScale}) => {
            console.log(calcResult[datum.timestamp.getTime()]);
        },
        tooltip: (d) => {
            const events: EconomicCalendarEvent[] = calcResult[d.timestamp.getTime()];

            return events.reduce((result, val) => {
                const { expectedVolatility, title, valuePrevious, valueForecast, valueActual } = val;
                return `${result}${result ? '\n\n' : ''}${title} (Volatility: ${expectedVolatility})\nPrev: ${valuePrevious} / Forecast: ${valueForecast} / Actual: ${valueActual}`;
            }, "");  
        },
        // onMouseOver: console.log.bind(console),
    };

    return (
        <Annotate with={LabelAnnotation}
            when={d => calcResult[d.timestamp.getTime()]}
            usingProps={annotationProps} />
    )
};

export default ChartNews;