import {Interval} from "../../../data/Interval";
import {SwingStateItemDto} from "./SwingStateItemDto";

export class SwingStateDto {
    public secId: number
    public interval: Interval
    public items: SwingStateItemDto[]
}