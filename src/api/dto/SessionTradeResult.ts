import {ClassCode} from "../../common/data/ClassCode";

export class SessionTradeResult {
    public trades: any[];
    public plPrice: number;
    public plStop: number;
    public plTarget: number;
    public classCode: ClassCode;
    public secCode: string;
    public start: Date;
}