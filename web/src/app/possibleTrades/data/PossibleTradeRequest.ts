import { Interval } from "../../../common/data/Interval";
import { OperationType } from "../../../common/data/OperationType";
import { SecurityFilter } from "../../../common/data/security/SecurityFilter";
import { TrendPoint } from "../../../common/data/strategy/TrendPoint";
import { Target } from "./Target";

export class PossibleTradeRequest extends SecurityFilter {
  public depositAmount: number;
  public depositMaxRiskPerTradeInPercent: number = 1;
  public timeFrame: Interval;
  public timeFrameLow: Interval;
  public entryPrice: number;
  public quantity: number;
}
