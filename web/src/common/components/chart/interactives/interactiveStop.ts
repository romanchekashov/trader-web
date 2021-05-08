import { InteractiveYCoordinate } from "react-financial-charts/lib/interactive";
import { OperationType } from "../../../data/OperationType";
import { StopOrder } from "../../../data/StopOrder";
import { Colors } from "../../../utils/utils";

const createInteractiveYCoordinateItem = (stop: StopOrder) => {
  return {
    interactiveYCoordinateItem: {
      ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
      textFill:
        stop.operation === OperationType.BUY ? Colors.GREEN : Colors.RED,
      text:
        (stop.operation === OperationType.BUY ? "Stop Buy " : "Stop Sell ") +
        stop.quantity,
      yValue: stop.conditionPrice,
      id: "stop_" + stop.transId,
      draggable: true,
    },
    type: "stop",
    orderOrStop: stop,
  };
};

const fillInteractiveMap = (interactiveOrderMap: any, stops: StopOrder[]) => {
  for (const stop of stops) {
    interactiveOrderMap[stop.transId] = createInteractiveYCoordinateItem(stop);
  }
};

export default {
  fillInteractiveMap,
};
