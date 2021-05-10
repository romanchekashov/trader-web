import { InteractiveYCoordinate } from "react-financial-charts/lib/interactive";
import { PossibleTrade } from "../../../../app/possibleTrades/data/PossibleTrade";
import { DataType } from "../../../data/DataType";
import { OperationType, OperationTypePrint } from "../../../data/OperationType";
import { Colors } from "../../../utils/utils";

const possibleTrade_entryPrice = "possibleTrade_entryPrice";
const possibleTrade_stopPrice = "possibleTrade_stopPrice";
const possibleTrade_targets = "possibleTrade_targets";

const interactiveMapContainsPossibleTrade = (
  interactiveOrderMap: any,
  possibleTrade: PossibleTrade
): boolean => {
  return (
    interactiveOrderMap[possibleTrade_entryPrice] &&
    interactiveOrderMap[possibleTrade_stopPrice] &&
    possibleTrade.targets.every(
      ({ price }) => interactiveOrderMap[possibleTrade_targets + price]
    )
  );
};

const fillInteractiveMap = (
  interactiveOrderMap: any,
  possibleTrade: PossibleTrade
) => {
  const tradeOperation = possibleTrade.operation;
  const tradeCloseOperation =
    possibleTrade.operation === OperationType.BUY
      ? OperationType.SELL
      : OperationType.BUY;

  // fill entry price
  if (possibleTrade.entryPrice) {
    interactiveOrderMap[possibleTrade_entryPrice] = {
      interactiveYCoordinateItem: {
        ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
        stroke: Colors.BLUE,
        textFill: Colors.BLUE,
        text: `PT: Entry ${OperationTypePrint[tradeOperation]} ${possibleTrade.quantity}`,
        edge: {
          ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
          stroke: Colors.BLUE,
        },
        yValue: possibleTrade.entryPrice,
        id: possibleTrade_entryPrice,
        draggable: true,
      },
      dataType: DataType.POSSIBLE_TRADE,
      data: possibleTrade,
    };
  }

  // fill stop price
  if (possibleTrade.stopPrice) {
    interactiveOrderMap[possibleTrade_stopPrice] = {
      interactiveYCoordinateItem: {
        ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
        stroke: Colors.RED,
        textFill: Colors.RED,
        text: `PT: Stop ${OperationTypePrint[tradeCloseOperation]} ${possibleTrade.quantity}`,
        edge: {
          ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
          stroke: Colors.RED,
        },
        yValue: possibleTrade.stopPrice,
        id: possibleTrade_stopPrice,
        draggable: true,
      },
      dataType: DataType.POSSIBLE_TRADE,
      data: possibleTrade,
    };
  }

  possibleTrade.targets.forEach((target) => {
    const key = possibleTrade_targets + target.price;
    interactiveOrderMap[key] = {
      interactiveYCoordinateItem: {
        ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
        stroke: Colors.GREEN,
        textFill: Colors.GREEN,
        text: `PT: Target ${OperationTypePrint[tradeCloseOperation]} ${target.quantity}`,
        edge: {
          ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
          stroke: Colors.GREEN,
        },
        yValue: target.price,
        id: key,
        draggable: true,
      },
      dataType: DataType.POSSIBLE_TRADE,
      data: possibleTrade,
    };
  });
};

export default {
  interactiveMapContainsPossibleTrade,
  fillInteractiveMap,
};
