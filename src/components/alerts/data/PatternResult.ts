import {PatternName} from "./PatternName";
import {PatternStrength} from "./PatternStrength";
import {Candle} from "../../../common/data/Candle";
import {Interval} from "../../../common/data/Interval";

export class PatternResult {
    public name: PatternName;
    public strength: PatternStrength;
    public hasConfirmation: boolean;
    public candle: Candle;
    public interval: Interval;
    public description: string;
    public possibleFutureDirectionUp: boolean;
}