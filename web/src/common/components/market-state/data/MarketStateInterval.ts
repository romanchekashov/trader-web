import {Interval} from "../../../data/Interval";
import {MarketStateItemDto} from "./MarketStateItemDto";

export class MarketStateInterval {
    public baseInterval: Interval;
    public baseItem: MarketStateItemDto;
    public interval: Interval;
    public items: MarketStateItemDto[];
}