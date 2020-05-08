import {ClassCode} from "../../../common/data/ClassCode";

export class TradeJournalFilterDto {
    public classCode: ClassCode;
    public secCode: string;
    public start: Date;
    public end: Date;
}