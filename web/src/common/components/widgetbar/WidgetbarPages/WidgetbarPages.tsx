import * as React from "react";
import { useEffect, useState } from "react";
import { ToggleButton } from "primereact/togglebutton";
import { BsNewspaper, BsCalendar } from "react-icons/bs";
import "./WidgetbarPages.css";
import { Tooltip } from "primereact/tooltip";
import { WidgetbarItem } from "../WidgetbarItem";
import { StockEventsBrief } from "../../share-event/StockEventsBrief";
import { SecurityLastInfo } from "../../../data/security/SecurityLastInfo";
import { SecurityLastInfoView } from "../../../../features/trading-charts/security/info/SecurityLastInfoView";
import { FilterDto } from "../../../data/FilterDto";
import { BrokerId } from "../../../data/BrokerId";
import { TradingPlatform } from "../../../data/trading/TradingPlatform";
import Notifications from "../../notifications/Notifications";
import { useAppDispatch } from "../../../../app/hooks";
import { setSecurityById } from "../../../../app/securities/securitiesSlice";

type Props = {
  item: WidgetbarItem | undefined;
  security: SecurityLastInfo | undefined;
};

const WidgetbarPages: React.FC<Props> = ({ item, security }) => {
  const dispatch = useAppDispatch();
  const [filterDto, setFilterDto] = useState<FilterDto>(null);

  useEffect(() => {
    setFilterDto({
      brokerId: BrokerId.ALFA_DIRECT,
      tradingPlatform: TradingPlatform.QUIK,
      secId: null,
      fetchByWS: false,
      history: false,
      all: true,
    });
  }, []);

  return (
    <div className="WidgetbarPages">
      <div>{item}</div>
      {security && item === WidgetbarItem.NEWS ? (
        <StockEventsBrief secCode={security.secCode} height={600} />
      ) : null}
      {security && item === WidgetbarItem.SEC_DATA ? (
        <SecurityLastInfoView security={security} />
      ) : null}
      {item === WidgetbarItem.NOTIFICATIONS ? (
        <Notifications
          filter={filterDto}
          security={security}
          onNotificationSelected={(n) => {
            dispatch(setSecurityById(n.secId));
            console.log(n);
          }}
          viewHeight={600}
          itemSize={120}
        />
      ) : null}
    </div>
  );
};

export default WidgetbarPages;
