import { post } from "../../common/api/apiUtils";
import { NotificationDto } from "../../common/components/notifications/data/NotificationDto";
import { FilterDto } from "../../common/data/FilterDto";

const baseUrl = process.env.API_URL + "/api/v1/notifications/";

const adjustNotifications = (
  notifications: NotificationDto[]
): NotificationDto[] => {
  if (notifications && notifications.length > 0) {
    for (const notification of notifications) {
      notification.created = new Date(notification.created);
      notification.notified = new Date(notification.notified);
    }
  }
  return notifications;
};

const getNotifications = (filter: FilterDto): Promise<NotificationDto[]> =>
  post<NotificationDto[]>(baseUrl, filter).then(adjustNotifications);

export default {
  getNotifications,
};
