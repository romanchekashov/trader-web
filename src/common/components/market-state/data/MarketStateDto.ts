import {ClassCode} from "../../../data/ClassCode";
import {MarketStateIntervalDto} from "./MarketStateIntervalDto";

export class MarketStateDto {
    public classCode: ClassCode;
    public secCode: string;
    public marketStateIntervals: MarketStateIntervalDto[];
}