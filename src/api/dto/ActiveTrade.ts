import {Trade} from "./Trade";
import {ClassCode} from "./ClassCode";
import {OperationType} from "./OperationType";

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
}