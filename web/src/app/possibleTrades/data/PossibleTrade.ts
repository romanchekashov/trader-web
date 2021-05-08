import { Interval } from "../../../common/data/Interval";
import { OperationType } from "../../../common/data/OperationType";
import { TrendPoint } from "../../../common/data/strategy/TrendPoint";
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
