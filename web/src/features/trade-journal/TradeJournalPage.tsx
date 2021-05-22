import * as React from "react";
import { useEffect, useRef, useState } from "react";
import DepositChangeChart from "../../app/deposits/components/DepositChangeChart/DepositChangeChart";
import statisticsApi from "../../app/statistics/statisticsApi";
import { ResultDto } from "../../common/data/journal/ResultDto";
import { Trade } from "../../common/data/journal/Trade";
import { SecurityType } from "../../common/data/security/SecurityType";
import { TradeJournalFilter } from "./filter/TradeJournalFilter";
import { TradeJournalFilterDto } from "./filter/TradeJournalFilterDto";
import ProfitLossChart from "./profitLossChart/ProfitLossChart";
import { TradeJournalStatistic } from "./statistic/TradeJournalStatistic";
import { TradeJournalTable } from "./table/TradeJournalTable";

const TradeJournalPage: React.FC<{}> = ({}) => {
  const [stat, setStat] = useState<ResultDto[]>([]);
  const [expandedRows, setExpandedRows] = useState<Trade[]>([]);

  const [profitLossChartWidth, setProfitLossChartWidth] =
    useState<number>(1200);
  const [depositChangeChartWidth, setDepositChangeChartWidth] =
    useState<number>(400);

  const onFilter = (filter: TradeJournalFilterDto): void => {
    statisticsApi.getTradeJournal(filter).then(setStat);
  };

  if (stat.length === 0) {
    return (
      <div className="p-grid sample-layout">
        <div className="p-col-12">
          <TradeJournalFilter onFilter={onFilter} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-grid sample-layout">
      <div className="p-col-12">
        <TradeJournalFilter onFilter={onFilter} />
      </div>
      <div
        ref={(refElem) => {
          if (refElem) {
            setProfitLossChartWidth(refElem.clientWidth - 20);
          }
        }}
        className="p-col-8"
      >
        <ProfitLossChart
          stat={stat.length > 0 ? stat[0] : null}
          width={profitLossChartWidth}
          height={300}
        />
      </div>
      <div
        ref={(refElem) => {
          if (refElem) {
            setDepositChangeChartWidth(refElem.clientWidth - 20);
          }
        }}
        className="p-col-4"
      >
        <DepositChangeChart
          securityType={SecurityType.FUTURE}
          width={depositChangeChartWidth}
          height={300}
        />
      </div>
      <div className="p-col-12">
        <TradeJournalStatistic stat={stat.length > 0 ? stat[0] : null} />
      </div>
      <div className="p-col-12 journal-trades-table">
        <TradeJournalTable stat={stat[0]} />
      </div>
    </div>
  );
};

export default TradeJournalPage;
