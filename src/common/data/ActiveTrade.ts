import {ClassCode} from "./ClassCode";
import {OperationType} from "./OperationType";
import {Trade} from "./Trade";
import {StopOrder} from "./StopOrder";

export class ActiveTrade {
    public classCode: ClassCode;
    public secCode: string;
    public quantity: number;
    public avgPrice: number;
    public plPrice: number;
    public plStop: number;
    public plTarget: number;
    public operation: OperationType;
    public start: Date;
    public trades: Trade[];
    public stopOrder: StopOrder;
}