import {PatternName} from "./PatternName";
import {PatternStrength} from "./PatternStrength";
import {Candle} from "../../../data/Candle";
import {Interval} from "../../../data/Interval";

export class PatternResult {
    public name: PatternName;
    public strength: PatternStrength;
    public hasConfirmation: boolean;
    public candle: Candle;
    public interval: Interval;
    public description: string;
    public possibleFutureDirectionUp: boolean;
}