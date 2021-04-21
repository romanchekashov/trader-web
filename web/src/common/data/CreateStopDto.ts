import {ClassCode} from "./ClassCode";

export class CreateStopDto {
    public classCode: ClassCode;
    public secCode: string;
    public stop: number;
}