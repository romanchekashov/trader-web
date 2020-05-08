import {ClassCode} from "../ClassCode";
import {Broker} from "../Broker";

export class Trade {
  public id: number;
  public broker: Broker;
  public price: number;
  public quantity: number;
  public value: number;
  public sell: boolean;
  public symbol: string;
  public dateTime: Date;
  public marketType: ClassCode;

  public quikPeriod: number;
  public quikClassCode: string;
  public quikTransId: number;
  public quikTradeNumber: number;
  public quikOrderNumber: number;
}
