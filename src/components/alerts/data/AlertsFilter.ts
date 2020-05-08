import {ClassCode} from "../../../common/data/ClassCode";

export class AlertsFilter {
    public classCode: ClassCode;
    public secCode: string;
    public fetchByWS: boolean;
    public history: boolean;
}