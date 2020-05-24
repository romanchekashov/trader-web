import {ClassCode} from "../../../data/ClassCode";
import {Interval} from "../../../data/Interval";
import {SwingStateItemDto} from "./SwingStateItemDto";

export class SwingStateDto {
    public classCode: ClassCode;
    public secCode: string;
    public interval: Interval;
    public items: SwingStateItemDto[];
}