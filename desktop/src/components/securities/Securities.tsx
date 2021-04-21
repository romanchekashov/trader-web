import * as React from "react";
import {SecurityLastInfo} from "../../common/data/SecurityLastInfo";

type Props = {
    securities: SecurityLastInfo[]
    onSecuritySelected: (security: SecurityLastInfo) => void
};

type States = {
    security: SecurityLastInfo
};

export class Securities extends React.Component<Props, States> {

    constructor(props) {
        super(props);
        this.state = { security: null };
    }

    onSecuritySelectedInner = (security: SecurityLastInfo) => {
        this.setState({security});
        this.props.onSecuritySelected(security);
    };

    itemTemplate = (option: SecurityLastInfo) => {
        const { security } = this.state;
        const style = {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingRight: '1px',
            cursor: "pointer"
        };

        if (security && option.secCode === security.secCode) {
            style["backgroundColor"] = "#ccc";
        }

        return (
            <div key={option.secCode} style={style}
                 onClick={() => {this.onSecuritySelectedInner(option)}}>
                <div style={{fontSize:'0.7em'}}>{option.shortName}</div>
                <div style={{fontSize:'0.9em', fontWeight: 600}}>{option.priceLastTrade}</div>
            </div>
        );
    };

    render() {
        const { securities } = this.props;

        if (securities.length === 0) {
            return <div>Loading...</div>
        }


        return (
            <div style={{width: "100%", minWidth: "0"}}>
                {securities.map(sec => this.itemTemplate(sec))}
            </div>
        )
    }
}