import {Interval} from "../data/Interval";

export function getTimeFrameHigh(main: Interval): Interval {
    switch (main) {
        case Interval.M3:
            return Interval.M30
        case Interval.M5:
            return Interval.M60
        case Interval.M30:
            return Interval.H4
        case Interval.M15:
            return Interval.H2
        case Interval.M60:
        case Interval.H2:
            return Interval.DAY
        case Interval.H4:
        case Interval.DAY:
            return Interval.WEEK
        default:
            return null
    }
}

export function getTimeFrameLow(main: Interval): Interval {
    switch (main) {
        case Interval.M3:
        case Interval.M5:
            return Interval.M1
        case Interval.M15:
            return Interval.M3
        case Interval.M30:
        case Interval.M60:
            return Interval.M5
        case Interval.H2:
            return Interval.M15
        case Interval.H4:
            return Interval.M30
        case Interval.DAY:
            return Interval.M60
        case Interval.WEEK:
        case Interval.MONTH:
            return Interval.DAY
        default:
            return null
    }
}