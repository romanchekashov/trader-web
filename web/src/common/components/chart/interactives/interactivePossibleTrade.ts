import { InteractiveYCoordinate } from "react-financial-charts/lib/interactive";
import { PossibleTrade } from "../../../../app/possibleTrades/data/PossibleTrade";
import { OperationType } from "../../../data/OperationType";
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
        text:
          (tradeOperation === OperationType.BUY
            ? "PT: Entry Buy "
            : "PT: Entry Sell ") + possibleTrade.quantity,
        edge: {
          ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
          stroke: Colors.BLUE,
        },
        yValue: possibleTrade.entryPrice,
        id: "possibleTrade_" + possibleTrade_entryPrice,
        draggable: true,
      },
      type: "possibleTrade",
      orderOrStop: possibleTrade,
    };
  }

  // fill stop price
  if (possibleTrade.stopPrice) {
    interactiveOrderMap[possibleTrade_stopPrice] = {
      interactiveYCoordinateItem: {
        ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
        stroke: Colors.RED,
        textFill: Colors.RED,
        text:
          (tradeCloseOperation === OperationType.BUY
            ? "PT: Stop Buy "
            : "PT: Stop Sell ") + possibleTrade.quantity,
        edge: {
          ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
          stroke: Colors.RED,
        },
        yValue: possibleTrade.stopPrice,
        id: "possibleTrade_" + possibleTrade_stopPrice,
        draggable: true,
      },
      type: "possibleTrade",
      orderOrStop: possibleTrade,
    };
  }

  possibleTrade.targets.forEach((target) => {
    const key = possibleTrade_targets + target.price;
    interactiveOrderMap[key] = {
      interactiveYCoordinateItem: {
        ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
        stroke: Colors.GREEN,
        textFill: Colors.GREEN,
        text:
          (tradeCloseOperation === OperationType.BUY
            ? "PT: Target Buy "
            : "PT: Target Sell ") + target.quantity,
        edge: {
          ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
          stroke: Colors.GREEN,
        },
        yValue: target.price,
        id: "possibleTrade_" + key,
        draggable: true,
      },
      type: "possibleTrade",
      orderOrStop: possibleTrade,
    };
  });
};

export default {
  interactiveMapContainsPossibleTrade,
  fillInteractiveMap,
};
