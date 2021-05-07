import { Candle } from "../Candle";
import { TrendDirection } from "./TrendDirection";

export class TrendPoint {
  public swingHL: number;
  public dateTime: Date;
  public minimum: boolean;
  public candle: Candle;
  public trendDirection: TrendDirection;
}
