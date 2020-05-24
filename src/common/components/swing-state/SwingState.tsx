import * as React from "react";
import {memo, useEffect, useState} from "react";
import "./SwingState.css";
import {FixedSizeList as List} from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import {Interval} from "../../data/Interval";
import {SwingStateDto} from "./data/SwingStateDto";
import {SwingStateItemDto} from "./data/SwingStateItemDto";
import moment = require("moment");

type Props = {
    swingState: SwingStateDto
};

const SwingState: React.FC<Props> = ({swingState}) => {
    if (!swingState) return null;

    const [dateTimeFormat, setDateTimeFormat] = useState<string>("HH:mm/DD-MM-YY");

    useEffect(() => {
        if (swingState) {
            switch (swingState.interval) {
                case Interval.M60:
                case Interval.H2:
                case Interval.H4:
                case Interval.DAY:
                case Interval.WEEK:
                case Interval.MONTH:
                    setDateTimeFormat("HH:mm/DD-MM-YY");
                    break;
                default:
                    setDateTimeFormat("HH:mm");
                    break;
            }
        }

        // Specify how to clean up after this effect:
        return function cleanup() {
        };
    }, [swingState]);

    const Row = ({index, style}) => {
        const item: SwingStateItemDto = swingState.items[index];
        const bullOrBear = item.startSwingPoint > item.endSwingPoint ? "bearish_weak " : "bullish_weak ";
        const oddOrEven = index % 2 ? "item-odd " : "item-even ";
        const className = "swing-state-column " + bullOrBear;

        return (
            <div className={className} style={style}>
                <div className="swing-state-column-item">
                    TD: {item.trendDirection}
                </div>
                <div className="swing-state-column-item">
                    E: {item.extension}
                </div>
                <div className="swing-state-column-item">
                    P: {item.projection}
                </div>
                <div className="swing-state-column-item">
                    D: {item.depth}
                </div>
                <div className="swing-state-column-item">
                    S: {item.speed} p/m
                </div>
                <div className="swing-state-column-item">
                    A: {item.acceleration}
                </div>
                <div className="swing-state-column-item">
                    START: {item.startSwingPoint}
                </div>
                <div className="swing-state-column-item">
                    END: {item.endSwingPoint}
                </div>
                <div className="swing-state-column-item swing-state-column-time">
                    {swingState.interval}|{moment(item.start).format(dateTimeFormat)}/{moment.duration(moment(item.start).diff(item.end)).humanize()}
                </div>
            </div>
        );
    };

    return (
        <div className="p-grid swing-state" style={{height: 200}}>
            <div className="p-col-12" style={{height: 200}}>
                <AutoSizer>
                    {({height, width}) => (
                        <List
                            className="List"
                            direction="rtl"
                            layout="horizontal"
                            height={height}
                            itemCount={swingState.items.length}
                            itemSize={100}
                            width={width}
                        >
                            {Row}
                        </List>
                    )}
                </AutoSizer>
            </div>
        </div>
    )
};

export default memo(SwingState);