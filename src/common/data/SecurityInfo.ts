import {ClassCode} from "./ClassCode";

export class SecurityInfo {
    public id: number;
    public classCode: ClassCode;
    public code: string;
    public futureSecCode: string;
    public name: string;
    public shortName: string;
    public scale: number;
    public expDate: Date;
    public lotSize: number;
    public minPriceStep: number;
}