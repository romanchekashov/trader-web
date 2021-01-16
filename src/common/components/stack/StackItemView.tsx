import * as React from "react";
import {StackItemWrapper} from "./data/StackItemWrapper";
import {IntervalColor} from "../../utils/utils";

type Props = {
    stackItemWrapper: StackItemWrapper
    onItemClick: (e: any, v: any) => void
}

export const StackItemView: React.FC<Props> = ({stackItemWrapper, onItemClick}) => {

    const {className, item, stackItemOrderClassName, style, quantity} = stackItemWrapper
    const color = IntervalColor[stackItemWrapper.srInterval] || '#000'

    const onMouseDown = (e: any): void => onItemClick(e, item)

    return (
        <div className={className}
             style={{color: color}}
             onMouseDown={onMouseDown}>
            <div className="stack-item-quantity" style={style}>{item.quantity}</div>
            <div className="stack-item-price" style={style}>{item.price}</div>
            <div className={stackItemOrderClassName}>{quantity !== 0 ? quantity : ""}</div>
        </div>
    )
};