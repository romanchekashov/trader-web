import { Interval } from "../../../data/Interval";
import { ClassCode } from "../../../data/ClassCode";
import { DataType } from "../../../data/DataType";

export class NotificationDto {
  public id: number;
  public secId: number;
  public code: string;
  public classCode: ClassCode;
  public price: number;
  public created: Date;
  public notified: Date;
  public timeInterval: Interval;
  public title: string;
  public text: string;
  public screenshot: string;
  public dataType: DataType;
  public data: any;
}
