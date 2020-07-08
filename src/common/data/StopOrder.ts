import {ClassCode} from "./ClassCode";
import {OperationType} from "./OperationType";
import {StopOrderStatus} from "./StopOrderStatus";

export class StopOrder {
    public transId?: number;
    public number?: number;
    public linkedOrderNum?: number;
    public classCode: ClassCode;
    public secCode: string;
    public price: number;
    public conditionPrice: number;
    public quantity: number;
    public operation: OperationType;
    public dateTime?: Date;
    public status: StopOrderStatus;
    public active: boolean;
}