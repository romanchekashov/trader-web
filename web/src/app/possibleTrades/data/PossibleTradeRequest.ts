import { Interval } from "../../../common/data/Interval";
import { OperationType } from "../../../common/data/OperationType";
import { OrderType } from "../../../common/data/OrderType";
import { SecurityFilter } from "../../../common/data/security/SecurityFilter";

export class PossibleTradeRequest extends SecurityFilter {
  public depositAmount: number;
  public depositMaxRiskPerTradeInPercent: number = 1;
  public timeFrame?: Interval;
  public entryPrice?: number;
  public stopPrice?: number;
  public quantity: number;
  public operation: OperationType;
  public orderType: OrderType;
}
