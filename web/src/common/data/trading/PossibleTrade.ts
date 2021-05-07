import { Interval } from "../Interval";
import { OperationType } from "../OperationType";
import { TrendPoint } from "../strategy/TrendPoint";
import { Target } from "./Target";

export class PossibleTrade {
  public secId: number;
  public timeFrame: Interval;
  public timeFrameLow: Interval;

  public plStop: number;
  public plTarget: number;

  public operation: OperationType;
  public quantity: number;
  public entryPrice: number;
  public stopPrice: number;
  public targets: Target[];
  public stopTrendPoint: TrendPoint;
}
