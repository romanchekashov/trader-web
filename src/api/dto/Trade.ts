import {ClassCode} from "../../data/ClassCode";
import {OperationType} from "./OperationType";

export class Trade {
    public classCode: ClassCode;
    public secCode: string;
    public strategy: string;
    public quantity: number;
    public price: number;
    public id: number;
    public transId: number;
    public operation: OperationType;
    public dateTime: Date;
}