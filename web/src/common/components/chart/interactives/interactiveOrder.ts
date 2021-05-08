import { InteractiveYCoordinate } from "react-financial-charts/lib/interactive";
import { OperationType } from "../../../data/OperationType";
import { Order } from "../../../data/Order";
import { Colors } from "../../../utils/utils";

const createInteractiveYCoordinateItem = (order: Order) => {
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
        id: "order_" + order.orderNum,
        draggable: true,
      },
      type: "order",
      orderOrStop: order,
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
        id: "order_" + order.orderNum,
        draggable: true,
      },
      type: "order",
      orderOrStop: order,
    };
  }
};

const fillInteractiveMap = (interactiveOrderMap: any, orders: Order[]) => {
  for (const order of orders) {
    interactiveOrderMap[order.orderNum] = createInteractiveYCoordinateItem(
      order
    );
  }
};

export default {
  fillInteractiveMap,
};
