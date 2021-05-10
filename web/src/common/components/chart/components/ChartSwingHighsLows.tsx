import * as React from "react";
import {
  Circle,
  LineSeries,
  ScatterSeries,
} from "react-financial-charts/lib/series";
import { TrendDirection } from "../../../data/strategy/TrendDirection";
import { TrendWrapper } from "../../../data/TrendWrapper";
import { IntervalColor, TrendDirectionColor } from "../../../utils/utils";

type Props = {
  swingHighsLows: TrendWrapper[];
};

export const ChartSwingHighsLows: React.FC<Props> = ({ swingHighsLows }) => {
  if (!swingHighsLows || swingHighsLows.length === 0) return null;

  const defaultColorStroke = "#757575";

  return (
    <>
      {swingHighsLows.map(({ isSelectedTimeFrame, trend }) => {
        const all = {};
        let color = IntervalColor[trend.interval];

        if (isSelectedTimeFrame) {
          color = color || "#2196f3";
          const up = {};
          const down = {};
          const side = {};
          const unknown = {};

          for (const trendPoint of trend.swingHighsLows) {
            switch (trendPoint.trendDirection) {
              case TrendDirection.DOWN:
                down[trendPoint.dateTime.getTime()] = trendPoint.swingHL;
                break;
              case TrendDirection.UP:
                up[trendPoint.dateTime.getTime()] = trendPoint.swingHL;
                break;
              case TrendDirection.SIDE:
                side[trendPoint.dateTime.getTime()] = trendPoint.swingHL;
                break;
              default:
                unknown[trendPoint.dateTime.getTime()] = trendPoint.swingHL;
                break;
            }
            all[trendPoint.dateTime.getTime()] = trendPoint.swingHL;
          }

          return (
            <React.Fragment key={`swingHighsLows-${isSelectedTimeFrame}`}>
              <ScatterSeries
                key={`keyDown-${isSelectedTimeFrame}-ScatterSeries`}
                yAccessor={(d) => down[d.timestamp.getTime()]}
                marker={Circle}
                markerProps={{
                  r: 3,
                  stroke: TrendDirectionColor[TrendDirection.DOWN],
                  fill: TrendDirectionColor[TrendDirection.DOWN],
                }}
              />

              <ScatterSeries
                key={`keyUp-${isSelectedTimeFrame}-ScatterSeries`}
                yAccessor={(d) => up[d.timestamp.getTime()]}
                marker={Circle}
                markerProps={{
                  r: 3,
                  stroke: TrendDirectionColor[TrendDirection.UP],
                  fill: TrendDirectionColor[TrendDirection.UP],
                }}
              />

              <ScatterSeries
                key={`keySide-${isSelectedTimeFrame}-ScatterSeries`}
                yAccessor={(d) => side[d.timestamp.getTime()]}
                marker={Circle}
                markerProps={{
                  r: 3,
                  stroke: TrendDirectionColor[TrendDirection.SIDE],
                  fill: TrendDirectionColor[TrendDirection.SIDE],
                }}
              />

              <ScatterSeries
                key={`keyUnknown-${isSelectedTimeFrame}-ScatterSeries`}
                yAccessor={(d) => unknown[d.timestamp.getTime()]}
                marker={Circle}
                markerProps={{ r: 3, stroke: color, fill: color }}
              />

              <LineSeries
                key={`keyAll-${isSelectedTimeFrame}-LineSeries`}
                yAccessor={(d) => all[d.timestamp.getTime()]}
                stroke={color}
                strokeDasharray="Solid"
                connectNulls={true}
              />
            </React.Fragment>
          );
        } else {
          color = color || defaultColorStroke;

          for (const trendPoint of trend.swingHighsLows) {
            all[trendPoint.dateTime.getTime()] = trendPoint.swingHL;
          }

          return (
            <React.Fragment key={`swingHighsLows-${isSelectedTimeFrame}`}>
              <LineSeries
                key={`keyAll-${isSelectedTimeFrame}-LineSeries`}
                yAccessor={(d) => all[d.timestamp.getTime()]}
                stroke={color}
                strokeDasharray="Solid"
                connectNulls={true}
              />
            </React.Fragment>
          );
        }
      })}
    </>
  );
};
