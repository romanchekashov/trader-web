import {NewsProvider} from "./NewsProvider";

export class SecurityShareEvent {
    public date: Date;
    public published: Date;
    public title: string;
    public href: string;
    public htmlText: string;
    public newsProvider: NewsProvider;
}