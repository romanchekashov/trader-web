import { del, get, post } from "../../common/api/apiUtils";
import { Order } from "../../common/data/Order";
import { adjustOrder, adjustOrders } from "../../common/utils/DataUtils";

const baseUrl = process.env.API_URL + "/api/v1/quik/orders/";

const getOrders = (): Promise<Order[]> =>
  get<Order[]>(baseUrl).then(adjustOrders);

const createOrder = (dto: Order): Promise<Order> =>
  post<Order>(baseUrl, dto).then(adjustOrder);

const deleteOrder = (num: string): Promise<Order> =>
  del<Order>(`${baseUrl}${num || ""}`).then(adjustOrder);

const deleteOrdersBySecId = (secId: number): Promise<Order[]> =>
  del<Order[]>(`${baseUrl}sec/${secId || ""}`).then(adjustOrders);

export default {
  getOrders,
  createOrder,
  deleteOrder,
  deleteOrdersBySecId,
};
