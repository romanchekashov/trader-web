import * as React from "react";
import {PriceCoordinate} from "react-financial-charts/lib/coordinates";
import {format} from "d3-format";
import {SRLevel} from "../../data/strategy/SRLevel";

type Props = {
    srLevels: SRLevel[]
};

export const ChartLevels: React.FC<Props> = ({srLevels}) => {

    const colorMap = {
        DAY: "#212121",
        H4: "#424242",
        H2: "#616161",
        M60: "#757575",
        M30: "#9e9e9e"
    };
    const lineTypeMap = {
        DAY: "LongDashDot",
        H4: "Dash",
        H2: "ShortDash",
        M60: "LongDash",
        M30: "Solid"
    };

    return (
        <>
            {
                srLevels.map(level => {
                    const color = colorMap[level.interval];
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
