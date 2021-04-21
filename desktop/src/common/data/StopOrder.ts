import {ClassCode} from "./ClassCode";
import {OperationType} from "./OperationType";

export class StopOrder {
    public transId?: number;
    public orderNum?: number;
    public classCode: ClassCode;
    public secCode: string;
    public price: number;
    public conditionPrice: number;
    public quantity: number;
    public operation: OperationType;
    public dateTime?: Date;
    public active: boolean;
}