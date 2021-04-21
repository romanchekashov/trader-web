import {ClientGroup} from "./ClientGroup";

export class MoexApiOpenInterest {
    public secCode: string;
    public clientGroup: ClientGroup;
    public position: number;
    public positionLong: number;
    public positionLongHolders: number;
    public positionShort: number;
    public positionShortHolders: number;
    public dateTime: Date;
}