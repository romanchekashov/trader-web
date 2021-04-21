import * as React from "react";
import {EconomicCalendar} from "../../common/components/economic-calendar/EconomicCalendar";

export const EconomicCalendarPage = () => {

    return (
        <div className="p-grid" style={{margin: 0}}>
            <div className="p-col-12">
                <EconomicCalendar/>
            </div>
            <div className="p-col-12">
                <a href="http://sslecal2.forexprostools.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&category=_employment,_economicActivity,_inflation,_credit,_centralBanks,_confidenceIndex,_balance,_Bonds&features=datepicker,timezone,timeselector,filters&countries=25,32,4,17,39,72,14,48,26,10,6,37,7,21,43,56,52,36,5,22,12,11,35&calType=week&timeZone=18&lang=1"
                   target="_blank">Economic Calendar for this Week on Investing.com</a>
            </div>
        </div>
    );
};
