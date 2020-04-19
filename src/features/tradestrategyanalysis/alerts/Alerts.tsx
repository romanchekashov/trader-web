import * as React from "react";
import {useEffect, useState} from "react";
import {WebsocketService, WSEvent} from "../../../api/WebsocketService";
import {getCandlePatterns} from "../../../api/tradestrategyanalysis/tradeStrategyAnalysisApi";
import {PatternResult} from "../../../api/dto/pattern/PatternResult";
import {AlertsFilter} from "./AlertsFilter";
import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";
import moment = require("moment");
import "./Alerts.css";
import {PatternName} from "../../../api/dto/pattern/PatternName";

type Props = {
    filter: AlertsFilter
};

const Alerts: React.FC<Props> = ({filter}) => {
    const columns = [
        {field: 'candle.timestamp', header: 'Time'},
        {field: 'name', header: 'Icon'},
        {field: 'candle.symbol', header: 'Symbol'},
        {field: 'strength', header: 'Strength'},
        {field: 'interval', header: 'Interval'},
        {field: 'hasConfirmation', header: 'Confirmed'}
    ];

    const [alerts, setAlerts] = useState([]);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [fetchAlertsAttempt, setFetchAlertsAttempt] = useState(0);

    const fetchAlerts = () => {
        getCandlePatterns(filter)
            .then(setAlerts)
            .catch(reason => {
                if (fetchAlertsAttempt < 3) {
                    setFetchAlertsAttempt(fetchAlertsAttempt + 1);
                    fetchAlerts();
                }
            });
    };

    useEffect(() => {
        let alertsSubscription;
        if (filter) {
            if (filter.fetchByWS) {
                alertsSubscription = WebsocketService.getInstance()
                    .on<PatternResult[]>(filter.history ? WSEvent.HISTORY_ALERTS : WSEvent.ALERTS)
                    .subscribe(alerts => {
                        setAlerts(alerts);
                    });
            } else {
                fetchAlerts();
            }
        }

        // Specify how to clean up after this effect:
        return function cleanup() {
            if (alertsSubscription) alertsSubscription.unsubscribe();
        };
    }, [filter]);

    const onAlertSelected = (e: any) => {
        setSelectedAlert(e.value);
    };

    if (!filter) {
        return (<>Filter for alerts is not set.</>);
    }

    const timeTemplate = (rowData, column) => {
        let data = rowData;
        column.field.split(".")
            .forEach(field => data = data[field]);
        return <>{moment(data).format("HH:mm - DD MMM YYYY")}</>;
    };

    const nameTemplate = (rowData, column) => {
        let className = "";
        if (PatternName.BEARISH_REVERSAL_PATTERN_SHOOTING_STAR === rowData[column.field]) {
            className = "shooting-star";
        }
        return <div className={className} title={rowData[column.field]}></div>;
    };

    const confirmTemplate = (rowData, column) => {
        let className = "";
        return <div className={className}>{rowData[column.field] ? "YES" : "NO"}</div>;
    };

    const columnComponents = columns.map(col => {
        if ("name" === col.field) {
            return <Column key={col.field} field={col.field} header={col.header}
                           body={nameTemplate}
                           style={{width: 40, paddingLeft: 0, paddingRight: 0}}/>;
        }
        if ("candle.timestamp" === col.field) {
            return <Column key={col.field} field={col.field} header={col.header}
                           body={timeTemplate}
                           style={{width: 140, paddingLeft: 5, paddingRight: 5}}/>;
        }
        if ("hasConfirmation" === col.field) {
            return <Column key={col.field} field={col.field} header={col.header}
                           body={confirmTemplate}/>;
        }
        return <Column key={col.field} field={col.field} header={col.header}/>;
    });

    return (
        <DataTable value={alerts} responsive
                   tableClassName="alerts-table"
                   selectionMode="single"
                   selection={selectedAlert}
                   onSelectionChange={onAlertSelected}
                   scrollable={true}
                   scrollHeight="200px">
            {columnComponents}
        </DataTable>
    )
};

export default Alerts;