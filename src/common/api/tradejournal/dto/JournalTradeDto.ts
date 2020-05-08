import {SecurityDto} from "./SecurityDto";
import {Trade} from "./Trade";

export class JournalTradeDto {
    public id: number;
    public security: SecurityDto;
    public isShort = false;

    public open: Date;
    public openPosition: number;
    public openSum: number;
    public openPrice: number;
    public openCommission: number;
    public openWhy: string;
    public openError: string;
    public openIdea: string;

    public close: Date;
    public closePosition: number;
    public closeSum: number;
    public closePrice: number;
    public closeCommission: number;
    public closeWhy: string;
    public closeError: string;
    public closeIdea: string;

    public riskMaxStop: number;
    public riskTakeProfit: number;

    public priceChange: number;
    public priceChangePercentage: number;
    public totalGainAndLoss: number;

    public trades: Trade[];
}