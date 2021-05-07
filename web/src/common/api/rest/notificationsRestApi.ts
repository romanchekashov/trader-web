import { NotificationDto } from "../../components/notifications/data/NotificationDto";
import { FilterDto } from "../../data/FilterDto";
import { handleError, handleResponse } from "../apiUtils";

const baseUrl = process.env.API_URL + "/api/v1/notifications/";

export function getNotifications(
  filter: FilterDto
): Promise<NotificationDto[]> {
  return fetch(baseUrl, {
    method: "POST", // POST for create, PUT to update when id already exists.
    headers: { "content-type": "application/json" },
    body: JSON.stringify(filter),
  })
    .then((response) =>
      handleResponse(response).then((notifications) => {
        if (notifications && notifications.length > 0) {
          for (const notification of notifications) {
            notification.created = new Date(notification.created);
            notification.notified = new Date(notification.notified);
          }
        }
        return notifications;
      })
    )
    .catch(handleError);
}
