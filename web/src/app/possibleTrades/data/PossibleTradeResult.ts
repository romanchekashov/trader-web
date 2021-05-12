import { PossibleTrade } from "./PossibleTrade";

export class PossibleTradeResult {
  public possibleTrade: PossibleTrade;
  public notified: Date;
  public plResult: number;
  public plHighTemp: number;
  public targetsHit: number;
}
