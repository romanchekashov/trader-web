import { InteractiveYCoordinate } from "react-financial-charts/lib/interactive";
import { DataType } from "../../../data/DataType";
import { OperationType } from "../../../data/OperationType";
import { StopOrder } from "../../../data/StopOrder";
import { Colors } from "../../../utils/utils";
import { Interactive } from "../CandleStickChartForDiscontinuousIntraDay";

const createInteractiveYCoordinateItem = (
  id: string,
  stop: StopOrder
): Interactive => {
  return {
    interactiveYCoordinateItem: {
      ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
      textFill:
        stop.operation === OperationType.BUY ? Colors.GREEN : Colors.RED,
      text:
        (stop.operation === OperationType.BUY ? "Stop Buy " : "Stop Sell ") +
        stop.quantity,
      yValue: stop.conditionPrice,
      id,
      draggable: true,
    },
    dataType: DataType.STOP_ORDER,
    data: stop,
  };
};

const fillInteractiveMap = (interactiveOrderMap: any, stops: StopOrder[]) => {
  for (const stop of stops) {
    const id = "stop_" + stop.transId;
    interactiveOrderMap[id] = createInteractiveYCoordinateItem(id, stop);
  }
};

export default {
  fillInteractiveMap,
};
