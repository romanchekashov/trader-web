import { format } from "d3-format";
import * as React from "react";
import { PriceCoordinate } from "react-financial-charts/lib/coordinates";
import { SRLevel } from "../../../data/strategy/SRLevel";
import { SrLevelType } from "../../../data/strategy/SrLevelType";
import { IntervalColor } from "../../../utils/utils";

type Props = {
  srLevels: SRLevel[];
  scale: number;
};

export const ChartLevels: React.FC<Props> = ({ srLevels, scale }) => {
  if (!srLevels || srLevels.length === 0) return null;

  const scaleFormat = `.${scale}f`;

  return (
    <>
      {srLevels
        // .filter(level => level.type)
        .map(({ interval, type, swingHL, dateTime }) => {
          const color = IntervalColor[interval];
          // let lineType = lineTypeMap[level.interval]
          const isToday =
            SrLevelType.TODAY_HIGH === type || SrLevelType.TODAY_LOW === type;
          const lineType = isToday ? "Solid" : "LongDash";

          return (
            <PriceCoordinate
              key={`start-${interval}${type}${swingHL}${dateTime}`}
              at="left"
              orient="left"
              price={swingHL}
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
          );
        })}
    </>
  );
};
