import { StopOrder } from "../../common/data/StopOrder";
import {
  adjustStopOrder,
  adjustStopOrders,
} from "../../common/utils/DataUtils";
import { del, get, post } from "../../common/api/apiUtils";

const baseUrl = process.env.API_URL + "/api/v1/quik/stop-orders/";

const getStopOrders = (): Promise<StopOrder[]> =>
  get<StopOrder[]>(baseUrl).then(adjustStopOrders);

const createStopOrder = (dto: StopOrder): Promise<StopOrder> =>
  post<StopOrder>(baseUrl, dto).then(adjustStopOrder);

const deleteStopOrder = (num: number): Promise<StopOrder> =>
  del<StopOrder>(`${baseUrl}${num || ""}`).then(adjustStopOrder);

const deleteStopOrdersBySecId = (secId: number): Promise<StopOrder[]> =>
  del<StopOrder[]>(`${baseUrl}sec/${secId || ""}`).then(adjustStopOrders);

export default {
  getStopOrders,
  createStopOrder,
  deleteStopOrder,
  deleteStopOrdersBySecId,
};
