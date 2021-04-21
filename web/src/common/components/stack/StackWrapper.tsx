import * as React from "react";
import {useState} from "react";
import "./Stack.css";
import {ToggleButton} from "primereact/togglebutton";
import {Stack} from "./Stack";

type Props = {}

export const StackWrapper: React.FC<Props> = ({}) => {
    const VisibleType = {
        HIDE: 'HIDE',
        VISIBLE: 'VISIBLE',
        VISIBLE_PART: 'VISIBLE_PART'
    }

    const ToggleVisibleType = {
        HIDE: -46,
        VISIBLE: -45,
        VISIBLE_PART: -47
    }

    const VisibleTypeViewTop = {
        HIDE: -460,
        VISIBLE: 0,
        VISIBLE_PART: -100
    }

    const [visible, setVisible] = useState<string>(VisibleType.HIDE)

    const toggleView = (e: any) => {
        setVisible(!e.value ? VisibleType.VISIBLE : VisibleType.HIDE)
    }

    const toggleViewPart = (e: any) => {
        setVisible(!e.value ? VisibleType.VISIBLE_PART : VisibleType.HIDE)
    }

    return (
        <div id="stack" className="td__stack" style={{right: VisibleTypeViewTop[visible]}}>
            <Stack/>
            <ToggleButton id="stack-toggle-btn"
                          checked={visible !== VisibleType.VISIBLE}
                          onChange={toggleView}
                          style={{left: ToggleVisibleType[visible]}}
                          onLabel="Show stack"
                          offLabel="Hide stack"/>
            <ToggleButton id="stack-toggle-btn-2"
                          checked={visible !== VisibleType.VISIBLE_PART}
                          onChange={toggleViewPart}
                          style={{left: ToggleVisibleType[visible] + 4}}
                          onLabel="Show part"
                          offLabel="Hide part"/>
        </div>
    )
}
