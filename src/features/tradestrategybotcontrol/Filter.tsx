import * as React from "react";
import {useState} from "react";
import {Toolbar} from 'primereact/toolbar';
import {Button} from "primereact/button";
import {Dropdown} from "primereact/dropdown";
import {MarketBotFilterDataDto} from "./dto/MarketBotFilterDataDto";
import {Broker} from "./dto/Broker";

export interface FilterState {
    broker: Broker;
}

type Props = {
    filter: MarketBotFilterDataDto;
};

const Filter: React.FC<Props> = ({filter}) => {
    let initState: FilterState = {
        broker: filter ? filter.broker : null
    };
    const brokers = filter ? [filter.broker] : [];
    const [filterState, setFilterState] = useState(initState);

    return (
        <Toolbar>
            <div className="p-toolbar-group-left">
                <Dropdown optionLabel="name" value={filterState.broker} options={brokers} onChange={(e) => {setFilterState({broker: e.value})}} placeholder="Select a broker"/>
                <Button label="New" icon="pi pi-plus" style={{marginRight: '.25em'}}/>
                <Button label="Upload" icon="pi pi-upload" className="p-button-success"/>
                <i className="pi pi-bars p-toolbar-separator" style={{marginRight: '.25em'}}/>
                <Button label="Save" icon="pi pi-check" className="p-button-warning"/>
            </div>
            <div className="p-toolbar-group-right">
                <Button icon="pi pi-search" style={{marginRight: '.25em'}}/>
                <Button icon="pi pi-calendar" className="p-button-success" style={{marginRight: '.25em'}}/>
                <Button icon="pi pi-times" className="p-button-danger"/>
            </div>
        </Toolbar>
    )
};

export default Filter;