import {ClassCode} from "../ClassCode";
import {Broker} from "../Broker";

export class Trade {
    public id: number;
    public classCode: ClassCode;
    public secCode: string;
    public broker: Broker;
    public price: number;
    public quantity: number;
    public value: number;
    public sell: boolean;
    public dateTime: Date;

    public quikPeriod: number;
    public quikClassCode: string;
    public quikTransId: number;
    public quikTradeNumber: number;
    public quikOrderNumber: number;
}
