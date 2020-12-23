import {StackItem} from "./StackItem";
import {Interval} from "../../../data/Interval";

export class StackItemWrapper {
    public price: number
    public quantity: number
    public item: StackItem
    public className: string
    public style: any
    public stackItemOrderClassName: string
    public srInterval?: Interval
}