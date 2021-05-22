import { SecurityType } from "../../../common/data/security/SecurityType";

export class TradeJournalFilterDto {
  public securityType: SecurityType;
  public secId: number;
  public start: Date;
  public end: Date;
}
