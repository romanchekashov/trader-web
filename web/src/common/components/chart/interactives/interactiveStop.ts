import { InteractiveYCoordinate } from "react-financial-charts/lib/interactive";
import { DataType } from "../../../data/DataType";
import { OperationType, OperationTypePrint } from "../../../data/OperationType";
import { StopOrder } from "../../../data/StopOrder";
import { StopOrderKind } from "../../../data/StopOrderKind";
import { Colors } from "../../../utils/utils";
import { Interactive } from "../CandleStickChartForDiscontinuousIntraDay";

const createInteractiveYCoordinateItem = (
  interactiveOrderMap: any,
  stop: StopOrder
) => {
  if (stop.kind === StopOrderKind.TAKE_PROFIT_AND_STOP_LIMIT_ORDER) {
    let id = `stop_${stop.transId}_target`;
    interactiveOrderMap[id] = {
      interactiveYCoordinateItem: {
        ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
        stroke: Colors.GREEN,
        textFill: Colors.GREEN,
        text: `Target ${OperationTypePrint[stop.operation]} ${stop.quantity}`,
        edge: {
          ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
          stroke: Colors.GREEN,
        },
        yValue: stop.conditionPrice,
        id,
        draggable: true,
      },
      dataType: DataType.STOP_ORDER,
      data: stop,
    };

    id = `stop_${stop.transId}_stop`;
    interactiveOrderMap[id] = {
      interactiveYCoordinateItem: {
        ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
        stroke: Colors.RED,
        textFill: Colors.RED,
        text: `Stop ${OperationTypePrint[stop.operation]} ${stop.quantity}`,
        edge: {
          ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
          stroke: Colors.RED,
        },
        yValue: stop.conditionPrice2,
        id,
        draggable: true,
      },
      dataType: DataType.STOP_ORDER,
      data: stop,
    };
  } else {
    const id = `stop_${stop.transId}_stop`;
    interactiveOrderMap[id] = {
      interactiveYCoordinateItem: {
        ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
        textFill:
          stop.operation === OperationType.BUY ? Colors.GREEN : Colors.RED,
        text: `Stop ${OperationTypePrint[stop.operation]} ${stop.quantity}`,
        yValue: stop.conditionPrice,
        id,
        draggable: true,
      },
      dataType: DataType.STOP_ORDER,
      data: stop,
    };
  }
};

const fillInteractiveMap = (interactiveOrderMap: any, stops: StopOrder[]) => {
  for (const stop of stops)
    createInteractiveYCoordinateItem(interactiveOrderMap, stop);
};

export default {
  fillInteractiveMap,
};
