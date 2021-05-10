import { InteractiveYCoordinate } from "react-financial-charts/lib/interactive";
import { DataType } from "../../../data/DataType";
import { OperationType } from "../../../data/OperationType";
import { Order } from "../../../data/Order";
import { Colors } from "../../../utils/utils";
import { Interactive } from "../CandleStickChartForDiscontinuousIntraDay";

const createInteractiveYCoordinateItem = (
  id: string,
  order: Order
): Interactive => {
  if (OperationType.BUY === order.operation) {
    return {
      interactiveYCoordinateItem: {
        ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
        stroke: Colors.GREEN,
        textFill: Colors.GREEN,
        text: "Buy " + order.quantity,
        edge: {
          ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
          stroke: Colors.GREEN,
        },
        yValue: order.price,
        id,
        draggable: true,
      },
      dataType: DataType.ORDER,
      data: order,
    };
  } else {
    return {
      interactiveYCoordinateItem: {
        ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
        stroke: Colors.RED,
        textFill: Colors.RED,
        text: "Sell " + order.quantity,
        edge: {
          ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
          stroke: Colors.RED,
        },
        yValue: order.price,
        id,
        draggable: true,
      },
      dataType: DataType.ORDER,
      data: order,
    };
  }
};

const fillInteractiveMap = (interactiveOrderMap: any, orders: Order[]) => {
  for (const order of orders) {
    const id = "order_" + order.orderNum;
    interactiveOrderMap[id] = createInteractiveYCoordinateItem(id, order);
  }
};

export default {
  fillInteractiveMap,
};
