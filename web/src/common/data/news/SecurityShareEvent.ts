import { NewsProvider } from "./NewsProvider";

export class SecurityShareEvent {
  public published: Date;
  public ticker: string;
  public title: string;
  public href: string;
  public htmlText: string;
  public newsProvider: NewsProvider;
}
