import {PatternName} from "./PatternName";
import {PatternStrength} from "./PatternStrength";
import {Candle} from "../../../../api/dto/Candle";
import {Interval} from "../../../../api/dto/Interval";

export class PatternResult {
    public name: PatternName;
    public strength: PatternStrength;
    public hasConfirmation: boolean;
    public candle: Candle;
    public interval: Interval;
}