import {ClassCode} from "../../../data/ClassCode";
import {AlertsSize} from "./AlertsSize";

export class AlertsFilter {
    public classCode: ClassCode;
    public secCode: string;
    public size: AlertsSize;
    public all: boolean;
    public fetchByWS: boolean;
    public history: boolean;
}