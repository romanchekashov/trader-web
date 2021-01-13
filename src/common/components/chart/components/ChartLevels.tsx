import * as React from "react";
import { PriceCoordinate } from "react-financial-charts/lib/coordinates";
import { format } from "d3-format";
import { SRLevel } from "../../../data/strategy/SRLevel";
import { IntervalColor } from "../../../utils/utils";
import { Interval } from "../../../data/Interval";
import { SrLevelType } from "../../../data/strategy/SrLevelType";

type Props = {
    srLevels: SRLevel[]
    scale: number
}

export const ChartLevels: React.FC<Props> = ({ srLevels, scale }) => {

    if (!srLevels || srLevels.length === 0) return null

    const lineTypeMap = {
        MONTH: "LongDashDotDot",
        WEEK: "LongDashDot",
        DAY: "Solid",
        H4: "LongDash",
        H2: "DashDot",
        M60: "Dash"
    }

    const scaleFormat = `.${scale}f`

    return (
        <>
            {
                srLevels
                    // .filter(level => level.type)
                    .map(level => {

                        const color = IntervalColor[level.interval]
                        // let lineType = lineTypeMap[level.interval]
                        const isToday = SrLevelType.TODAY_HIGH === level.type || SrLevelType.TODAY_LOW === level.type
                        const lineType = isToday ? "Solid" : "LongDash"

                        return (
                            <PriceCoordinate
                                key={"start-" + level.interval + level.swingHL + level.dateTime + level.type}
                                at="left"
                                orient="left"
                                price={level.swingHL}
                                stroke={color}
                                strokeDasharray={lineType}
                                lineStroke={color}
                                lineOpacity={1}
                                strokeWidth={2}
                                fontSize={12}
                                fill={color}
                                arrowWidth={7}
                                displayFormat={format(scaleFormat)}
                            />
                        )
                    })
            }
        </>
    )
}
