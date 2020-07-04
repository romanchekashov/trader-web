import * as React from "react";

export const EconomicCalendarPage = () => {
    const widget = '<iframe src="http://sslecal2.forexprostools.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&category=_employment,_economicActivity,_inflation,_credit,_centralBanks,_confidenceIndex,_balance,_Bonds&features=datepicker,timezone,timeselector,filters&countries=29,25,54,145,47,34,174,163,32,70,6,232,27,37,122,15,78,113,107,55,24,121,59,89,72,71,22,17,51,39,93,106,14,48,66,33,23,10,119,35,92,102,57,94,97,68,96,103,111,42,109,188,7,139,247,105,172,21,43,20,60,87,44,193,125,45,53,38,170,100,56,80,52,238,36,90,112,110,11,26,162,9,12,46,85,41,202,63,123,61,143,4,5,138,178,84,75&calType=week&timeZone=18&lang=1" ' +
        ' sandbox="allow-scripts" width="650" height="467" frameborder="0" allowtransparency="true" marginwidth="0" marginheight="0"></iframe><div class="poweredBy" style="font-family: Arial, Helvetica, sans-serif;"><span style="font-size: 11px;color: #333333;text-decoration: none;">Real Time Economic Calendar provided by <a href="https://www.investing.com/" rel="nofollow" target="_blank" style="font-size: 11px;color: #06529D; font-weight: bold;" class="underline_link">Investing.com</a>.</span></div>';

    return (
        <div dangerouslySetInnerHTML={{
            __html: widget
        }}>
        </div>
    );
};
