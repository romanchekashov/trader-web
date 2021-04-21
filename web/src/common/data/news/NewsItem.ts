import {NewsProvider} from "./NewsProvider";

export class NewsItem {
    public title: string
    public timestamp: Date
    public stimestamp: string
    public newsProvider: NewsProvider
    public href: string
    public brief: string
    public text: string
    public html: boolean
}