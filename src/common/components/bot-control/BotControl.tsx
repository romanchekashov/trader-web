import * as React from "react";
import {useEffect, useState} from "react";
import "./BotControl.css";
import {ToggleButton} from "primereact/togglebutton";

enum VisibleType {
    HIDE = 'HIDE',
    VISIBLE = 'VISIBLE',
    VISIBLE_PART = 'VISIBLE_PART'
}

export const BotControl: React.FC = () => {

    const ToggleVisibleType = {
        HIDE: -58,
        VISIBLE: -60,
        VISIBLE_PART: -58
    };

    const VisibleTypeViewTop = {
        HIDE: -260,
        VISIBLE: 0,
        VISIBLE_PART: -100
    };

    const [visible, setVisible] = useState(VisibleType.HIDE);

    useEffect(() => {
    });

    const toggleView = (toggle: boolean) => {
        setVisible(!toggle ? VisibleType.VISIBLE : VisibleType.HIDE)
    };

    const toggleViewPart = (toggle: boolean) => {
        setVisible(!toggle ? VisibleType.VISIBLE_PART : VisibleType.HIDE)
    };

    return (
        <div id="bot-control" style={{left: VisibleTypeViewTop[visible]}}>
            <div>

            </div>

            <ToggleButton id="bot-control-toggle-btn"
                          checked={visible !== VisibleType.VISIBLE}
                          onChange={(e) => toggleView(e.value)}
                          style={{right: ToggleVisibleType[visible]}}
                          onLabel="Show Bot Control"
                          offLabel="Hide Bot Control"/>

            <ToggleButton id="bot-control-toggle-btn-2"
                          checked={visible !== VisibleType.VISIBLE_PART}
                          onChange={(e) => toggleViewPart(e.value)}
                          style={{right: ToggleVisibleType[visible] + 16}}
                          onLabel="Show part"
                          offLabel="Hide part"/>
        </div>
    )
};
