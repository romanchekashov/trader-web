import {strokeDashTypes} from "react-financial-charts/src/utils";

export class ChartElementAppearance {
    public stroke?: string;
    public strokeOpacity?: number;
    public strokeWidth?: number;
    public strokeDasharray?: strokeDashTypes;
    public edgeStrokeWidth?: number;
    public edgeFill?: string;
    public edgeStroke?: string;
}