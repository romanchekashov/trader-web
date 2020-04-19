import {PatternName} from "./PatternName";
import {PatternStrength} from "./PatternStrength";
import {Candle} from "../Candle";
import {Interval} from "../Interval";

export class PatternResult {
    public name: PatternName;
    public strength: PatternStrength;
    public hasConfirmation: boolean;
    public candle: Candle;
    public interval: Interval;
}