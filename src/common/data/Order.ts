import {ClassCode} from "./ClassCode";
import {OrderType} from "./OrderType";
import {OperationType} from "./OperationType";
import {OrderStatus} from "./OrderStatus";

export class Order {
    public id?: number;
    public transId?: number;
    public orderNum?: number;
    public classCode: ClassCode;
    public secCode: string;
    public price: number;
    public quantity: number;
    public type: OrderType;
    public operation: OperationType;
    public dateTime?: Date;
    public balance?: number;
    public value?: number;
    public status?: OrderStatus;
}