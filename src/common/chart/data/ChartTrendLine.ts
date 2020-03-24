import {ChartTrendLineType} from "./ChartTrendLineType";
import {ChartElementAppearance} from "./ChartElementAppearance";

export class ChartTrendLine {
    public start: number[];
    public end: number[];
    public type: ChartTrendLineType = ChartTrendLineType.LINE;
    public appearance?: ChartElementAppearance;
}