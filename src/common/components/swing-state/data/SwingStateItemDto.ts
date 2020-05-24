import {TrendDirection} from "../../../data/strategy/TrendDirection";

export class SwingStateItemDto {
    public projection: number;
    public extension: number;
    public depth: number;
    public startSwingPoint: number;
    public endSwingPoint: number;
    public start: Date;
    public end: Date;
    public trendDirection: TrendDirection;
    public speed: number;
    public acceleration: number;
}