import * as React from "react";
import { OperationType } from "../../data/OperationType";
import { PossibleTrade } from "../../data/trading/PossibleTrade";
import { round10 } from "../../utils/utils";
import "./styles/Notifications.css";
import "./styles/Signals.css";
import moment = require("moment");

type Props = {
  possibleTrade: PossibleTrade;
};

const NotificationPossibleTrade: React.FC<Props> = ({ possibleTrade }) => {
  const {
    secId,
    timeFrame,
    plStop,
    plTarget,
    operation,
    quantity,
    entryPrice,
    targets,
  } = possibleTrade;

  return (
    <div className="NotificationPossibleTrade">
      <div className="less_important">
        Possible trade: {secId} - {timeFrame}
      </div>
      <div>
        plTarget: {plTarget} / plStop: {plStop} = {round10(plTarget / plStop)}
      </div>
      <div>
        {operation === OperationType.SELL ? "SELL" : "BUY"} {quantity} by{" "}
        {entryPrice}
      </div>
      <div className="less_important">
        Targets:{" "}
        {targets
          .map(({ quantity, price }) => `${quantity} - ${price}`)
          .join(", ")}
      </div>
    </div>
  );
};

export default NotificationPossibleTrade;
