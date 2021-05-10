import { OperationType } from "./OperationType";
import { SecurityType } from "./security/SecurityType";
import { OffsetSpreadUnits } from "./stop/OffsetSpreadUnits";
import { StopOrderKind } from "./StopOrderKind";
import { StopOrderStatus } from "./StopOrderStatus";

/**
conditionPrice: 67.5
dateTime: "1975-02-19T21:33:16.099+03:00"
kind: "TAKE_PROFIT_AND_STOP_LIMIT_ORDER"
linkedOrderNum: "0"
number: 1485016
offset: null
offsetUnits: "PRICE_UNITS"
operation: "B"
price: 68.82
quantity: 1
secCode: "BRM1"
secId: 372
securityType: "FUTURE"
spread: null
spreadUnits: "PRICE_UNITS"
status: "ACTIVE"
stopprice2: null
transId: 1383000
 */
export class StopOrder {
  public securityType: SecurityType;
  public secCode: string;
  public secId: number;

  public kind!: StopOrderKind;
  public transId?: number;
  public number?: number;
  public linkedOrderNum?: string;

  public quantity: number;
  public operation: OperationType;
  public status?: StopOrderStatus;
  public dateTime?: Date;

  // stop
  public conditionPrice2?: number; // stop activation price for TAKE_PROFIT_AND_STOP_LIMIT_ORDER
  public price: number;
  // target
  public conditionPrice: number; // target activation price for TAKE_PROFIT_AND_STOP_LIMIT_ORDER
  public offset?: number;
  public offsetUnits?: OffsetSpreadUnits = OffsetSpreadUnits.PRICE_UNITS;
  public spread?: number;
  public spreadUnits?: OffsetSpreadUnits = OffsetSpreadUnits.PRICE_UNITS;
}
