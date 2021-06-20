import { ClassCode } from "../../../../data/ClassCode"

export class AnonymousTrade {
    public trade_num: number
    public sell: boolean
    public price: number
    public qty: number
    public value: number
    public settlecode: string
    public sec_code: string
    public class_code: ClassCode
    public datetime: Date
    public period: number
    public open_interest: number
}