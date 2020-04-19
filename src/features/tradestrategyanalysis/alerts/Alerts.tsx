import * as React from "react";
import {useEffect, useState} from "react";
import {WebsocketService, WSEvent} from "../../../api/WebsocketService";
import {getCandlePatterns} from "../../../api/tradestrategyanalysis/tradeStrategyAnalysisApi";
import {PatternResult} from "../../../api/dto/pattern/PatternResult";
import {AlertsFilter} from "./AlertsFilter";
import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";
import "./Alerts.css";
import {PatternName} from "../../../api/dto/pattern/PatternName";
import moment = require("moment");

type Props = {
    filter: AlertsFilter
};
let fetchAlertsAttempt = 0;

const Alerts: React.FC<Props> = ({filter}) => {
    const columns = [
        {field: 'candle.timestamp', header: 'Time'},
        {field: 'name', header: 'Icon'},
        {field: 'candle.symbol', header: 'Symbol'},
        {field: 'strength', header: 'Strength'},
        {field: 'hasConfirmation', header: 'Confirmed'}
    ];

    const [alerts, setAlerts] = useState([]);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [fetchAlertsError, setFetchAlertsError] = useState(null);

    const fetchAlerts = () => {
        getCandlePatterns(filter)
            .then(alerts => {
                setAlerts(alerts);
                setFetchAlertsError(null);
            })
            .catch(reason => {
                setAlerts([]);
                setFetchAlertsError("Cannot get alerts for " + filter.secCode);
                if (fetchAlertsAttempt < 3) {
                    fetchAlertsAttempt++;
                    fetchAlerts();
                }
            });
    };

    useEffect(() => {
        let alertsSubscription;
        if (filter) {
            fetchAlertsAttempt = 0;
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

    if (filter && fetchAlertsError) {
        return (<div style={{color: "red"}}>{fetchAlertsError}</div>);
    }

    const timeTemplate = (rowData, column) => {
        let data = rowData;
        column.field.split(".")
            .forEach(field => data = data[field]);
        return <>{moment(data).format("HH:mm - DD MMM YYYY")}</>;
    };

    const nameTemplate = (rowData, column) => {
        let className = "alert-icon ";
        if (PatternName.BEARISH_REVERSAL_PATTERN_SHOOTING_STAR === rowData[column.field]) {
            className += "shooting-star-" + rowData.interval.toString().toLowerCase();
        }
        return <div className={className} title={rowData[column.field]}></div>;
    };

    const confirmTemplate = (rowData, column) => {
        let fontWeight = 500;
        const confirmed: boolean = rowData[column.field];
        if (confirmed) fontWeight = 700;
        return <div style={{fontWeight}}>{confirmed ? "YES" : "NO"}</div>;
    };

    const columnComponents = columns.map(col => {
        if ("name" === col.field) {
            return <Column key={col.field} field={col.field} header={col.header}
                           body={nameTemplate} className="alerts-table-col-icon"/>;
        }
        if ("candle.timestamp" === col.field) {
            return <Column key={col.field} field={col.field} header={col.header}
                           body={timeTemplate}
                           style={{width: 140, paddingLeft: 5, paddingRight: 5}}/>;
        }
        if ("candle.symbol" === col.field) {
            return <Column key={col.field} field={col.field} header={col.header} className="alerts-table-col-symbol"/>;
        }
        if ("hasConfirmation" === col.field) {
            return <Column key={col.field} field={col.field} header={col.header}
                           body={confirmTemplate}
                           className="alerts-table-col-confirm"/>;
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