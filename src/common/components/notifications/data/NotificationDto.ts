import {Interval} from "../../../data/Interval";
import {ClassCode} from "../../../data/ClassCode";

export class NotificationDto {
    public id: number;
    public classCode: ClassCode;
    public securityCode: string;
    public price: number;
    public created: Date;
    public notified: Date;
    public timeInterval: Interval;
    public title: string;
    public text: string;
}