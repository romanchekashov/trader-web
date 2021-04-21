import {Interval} from "../data/Interval";

const map = {}
map[Interval.M1] = 1 // 1 minute
map[Interval.M2] = 2
map[Interval.M3] = 3
map[Interval.M4] = 4
map[Interval.M5] = 5
map[Interval.M6] = 6
map[Interval.M10] = 10
map[Interval.M15] = 15
map[Interval.M20] = 20
map[Interval.M30] = 30
map[Interval.M60] = 60
map[Interval.H2] = 120 // 2 hour
map[Interval.H4] = 240
map[Interval.DAY] = 1440
map[Interval.WEEK] = 10080
map[Interval.MONTH] = 23200

const intervalCompare = (a: Interval, b: Interval): number => {
    if (map[a] > map[b]) return 1
    if (map[a] < map[b]) return -1
    return 0
}
export default intervalCompare