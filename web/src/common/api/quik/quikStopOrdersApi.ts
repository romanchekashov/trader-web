import { StopOrder } from "../../data/StopOrder";
import { adjustStopOrder, adjustStopOrders } from "../../utils/DataUtils";
import { del, get, post } from "../apiUtils";

const baseUrl = process.env.API_URL + "/api/v1/quik/stop-orders/";

const getStopOrders = (): Promise<StopOrder[]> =>
  get<StopOrder[]>(baseUrl).then(adjustStopOrders);

const createStopOrder = (dto: StopOrder): Promise<StopOrder> =>
  post<StopOrder>(baseUrl, dto).then(adjustStopOrder);

const deleteStopOrder = (num: number): Promise<StopOrder> =>
  del<StopOrder>(`${baseUrl}${num}`).then(adjustStopOrder);

export default {
  getStopOrders,
  createStopOrder,
  deleteStopOrder,
};