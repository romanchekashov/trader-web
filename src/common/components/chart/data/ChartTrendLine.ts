import {ChartTrendLineType} from "./ChartTrendLineType";
import {ChartElementAppearance} from "./ChartElementAppearance";

export class ChartTrendLine {
    public id: number;
    public start: number[];
    public end: number[];
    public selected: boolean = false;
    public type: ChartTrendLineType = ChartTrendLineType.RAY;
    public appearance: ChartElementAppearance = {
        edgeFill: "#FFFFFF",
        edgeStroke: "#000000",
        edgeStrokeWidth: 1,
        r: 6,
        stroke: "#000000",
        strokeDasharray: "Solid",
        strokeOpacity: 1,
        strokeWidth: 1
    };
}