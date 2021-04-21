export class MoexOpenInterest {
    public secCode: string;

    public fizPosLong: number;
    public fizPosShort: number;
    public yurPosLong: number;
    public yurPosShort: number;
    public posTotal: number;

    public changeFizPosLong: number;
    public changeFizPosShort: number;
    public changeYurPosLong: number;
    public changeYurPosShort: number;
    public changePosTotal: number;

    public fizPosLongHolders: number;
    public fizPosShortHolders: number;
    public yurPosLongHolders: number;
    public yurPosShortHolders: number;
    public posHoldersTotal: number;

    public dateTime: Date;
}