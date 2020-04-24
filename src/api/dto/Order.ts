import {ClassCode} from "../../data/ClassCode";
import {OrderType} from "./OrderType";
import {OperationType} from "./OperationType";

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
    public balance?: number;
    public value?: number;
    public dateTime?: Date;
}