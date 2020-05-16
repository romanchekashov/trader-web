import * as React from "react";
import {PriceCoordinate} from "react-financial-charts/lib/coordinates";
import {format} from "d3-format";
import {SRLevel} from "../../data/strategy/SRLevel";
import {IntervalColor} from "../../utils/utils";

type Props = {
    srLevels: SRLevel[]
};

export const ChartLevels: React.FC<Props> = ({srLevels}) => {

    if (!srLevels || srLevels.length === 0) return null;

    const lineTypeMap = {
        MONTH: "LongDashDotDot",
        WEEK: "LongDashDot",
        DAY: "Solid",
        H4: "LongDash",
        H2: "DashDot",
        M60: "Dot"
    };

    return (
        <>
            {
                srLevels.map(level => {
                    const color = IntervalColor[level.interval];
                    return (
                        <PriceCoordinate
                            key={"start-" + level.interval + level.swingHL + level.dateTime}
                            at="left"
                            orient="left"
                            price={level.swingHL}
                            stroke={color}
                            strokeDasharray={lineTypeMap[level.interval]}
                            lineStroke={color}
                            lineOpacity={1}
                            strokeWidth={2}
                            fontSize={12}
                            fill={color}
                            arrowWidth={7}
                            displayFormat={format(".2f")}
                        />
                    );
                })
            }
        </>
    )
};
