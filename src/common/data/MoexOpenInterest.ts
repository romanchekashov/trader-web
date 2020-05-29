export class MoexOpenInterest {
    public secCode: string;

    public openInterestIndividualsLong: number;
    public openInterestIndividualsShort: number;
    public openInterestLegalEntitiesLong: number;
    public openInterestLegalEntitiesShort: number;
    public openInterestTotal: number;

    public changeIndividualsLong: number;
    public changeIndividualsShort: number;
    public changeLegalEntitiesLong: number;
    public changeLegalEntitiesShort: number;
    public changeTotal: number;

    public entitiesWithOpenPositionsIndividualsLong: number;
    public entitiesWithOpenPositionsIndividualsShort: number;
    public entitiesWithOpenPositionsLegalEntitiesLong: number;
    public entitiesWithOpenPositionsLegalEntitiesShort: number;
    public entitiesWithOpenPositionsTotal: number;

    public updated: Date;
}