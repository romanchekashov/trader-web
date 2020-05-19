import * as React from "react";
import {useState} from "react";

type Props = {
    onSelectedPosition: (pos: number) => void
};

export const StackSwitcher: React.FC<Props> = ({onSelectedPosition}) => {

    const positions = [1, 2, 4, 5, 10, 15, 20, 25];
    const [position, setPosition] = useState(1);

    return (
        <div className="td__stack-switcher">
            {
                positions.map(pos => <div key={pos}
                                          className={pos === position ? "active" : ""}
                                          onClick={(e) => {
                                              setPosition(pos);
                                              onSelectedPosition(pos);
                                          }}>{pos}</div>)
            }
        </div>
    )
};