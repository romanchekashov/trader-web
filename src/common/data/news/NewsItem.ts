import {NewsProvider} from "./NewsProvider";

export class NewsItem {
    public newsProvider: NewsProvider;
    public href: string;
    public title: string;
    public brief: string;
    public text: string;
    public timestamp: Date;
    public html: boolean;
}