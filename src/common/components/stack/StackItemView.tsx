import * as React from "react";
import {StackItemWrapper} from "./data/StackItemWrapper";

type Props = {
    stackItemWrapper: StackItemWrapper
    onItemClick: (e: any, v: any) => void
};

export const StackItemView: React.FC<Props> = ({stackItemWrapper, onItemClick}) => {

    const {className, item, stackItemOrderClassName, style, quantity} = stackItemWrapper;

    return (
        <div className={className}
             onMouseDown={(e) => onItemClick(e, item)}>
            <div className="stack-item-quantity" style={style}>{item.quantity}</div>
            <div className="stack-item-price" style={style}>{item.price}</div>
            <div className={stackItemOrderClassName}>{quantity !== 0 ? quantity : ""}</div>
        </div>
    )
};