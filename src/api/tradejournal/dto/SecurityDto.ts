export class SecurityDto {
    public symbol: string;
    public name: string;
    public brokerName?: string = "";
    public brokerCommission?: number;
    public marketType?: string = "";
}