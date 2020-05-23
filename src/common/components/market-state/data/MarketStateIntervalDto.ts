import {Interval} from "../../../data/Interval";
import {MarketStateItemDto} from "./MarketStateItemDto";

export class MarketStateIntervalDto {
    public interval: Interval;
    public items: MarketStateItemDto[];
}