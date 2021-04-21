import * as React from "react";
import {LineSeries} from "react-financial-charts/lib/series";

export interface KeltnerChannelSeriesProps {
    readonly areaClassName?: string;
    readonly className?: string;
    readonly fillStyle?: string;
    readonly strokeStyle?: {
        emaPlus3Atr: string;
        emaPlus2Atr: string;
        emaPlusAtr: string;
        ema: string;
        emaMinusAtr: string;
        emaMinus2Atr: string;
        emaMinus3Atr: string;
    };
    readonly yAccessor?: (data: any) => { ema: number; atr: number; };
}

export class KeltnerChannelSeries extends React.Component<KeltnerChannelSeriesProps> {
    public static defaultProps = {
        areaClassName: "react-financial-charts-bollinger-band-series-area",
        fillStyle: "rgba(38, 166, 153, 0.05)",
        strokeStyle: {
            emaPlus3Atr: "#aaaaaa",
            emaPlus2Atr: "#aaaaaa",
            emaPlusAtr: "#aaaaaa",
            ema: "#3f51b5",
            emaMinusAtr: "#aaaaaa",
            emaMinus2Atr: "#aaaaaa",
            emaMinus3Atr: "#aaaaaa"
        },
        yAccessor: (data: any) => data.bb,
    }

    public render() {
        const {className, strokeStyle = KeltnerChannelSeries.defaultProps.strokeStyle, fillStyle} = this.props;

        return (
            <g className={className}>
                <LineSeries yAccessor={this.yAccessorForEmaPlus3Atr} stroke={strokeStyle.emaPlus3Atr}/>
                <LineSeries yAccessor={this.yAccessorForEmaPlus2Atr} stroke={strokeStyle.emaPlus2Atr}/>
                <LineSeries yAccessor={this.yAccessorForEmaPlusAtr} stroke={strokeStyle.emaPlusAtr}/>
                <LineSeries yAccessor={this.yAccessorForEma} stroke={strokeStyle.ema}/>
                <LineSeries yAccessor={this.yAccessorForEmaMinusAtr} stroke={strokeStyle.emaMinusAtr}/>
                <LineSeries yAccessor={this.yAccessorForEmaMinus2Atr} stroke={strokeStyle.emaMinus2Atr}/>
                <LineSeries yAccessor={this.yAccessorForEmaMinus3Atr} stroke={strokeStyle.emaMinus3Atr}/>
            </g>
        )
    }

    private readonly yAccessorForEmaPlus3Atr = (d: any) => {
        const {yAccessor = KeltnerChannelSeries.defaultProps.yAccessor} = this.props;

        const bb = yAccessor(d);
        if (bb === undefined) {
            return undefined;
        }

        const ema = bb.ema(d)
        const atr = bb.atr(d)

        return ema + atr + atr + atr
    }

    private readonly yAccessorForEmaPlus2Atr = (d: any) => {
        const {yAccessor = KeltnerChannelSeries.defaultProps.yAccessor} = this.props;

        const bb = yAccessor(d);
        if (bb === undefined) {
            return undefined;
        }

        const ema = bb.ema(d)
        const atr = bb.atr(d)

        return ema + atr + atr
    }

    private readonly yAccessorForEmaPlusAtr = (d: any) => {
        const {yAccessor = KeltnerChannelSeries.defaultProps.yAccessor} = this.props;

        const bb = yAccessor(d);
        if (bb === undefined) {
            return undefined;
        }

        const ema = bb.ema(d)
        const atr = bb.atr(d)

        return ema + atr
    }

    private readonly yAccessorForEma = (d: any) => {
        const {yAccessor = KeltnerChannelSeries.defaultProps.yAccessor} = this.props;

        const bb = yAccessor(d);
        if (bb === undefined) {
            return undefined;
        }

        return bb.ema(d)
    }

    private readonly yAccessorForEmaMinusAtr = (d: any) => {
        const {yAccessor = KeltnerChannelSeries.defaultProps.yAccessor} = this.props;

        const bb = yAccessor(d);
        if (bb === undefined) {
            return undefined;
        }

        const ema = bb.ema(d)
        const atr = bb.atr(d)

        return ema - atr
    }

    private readonly yAccessorForEmaMinus2Atr = (d: any) => {
        const {yAccessor = KeltnerChannelSeries.defaultProps.yAccessor} = this.props;

        const bb = yAccessor(d);
        if (bb === undefined) {
            return undefined;
        }

        const ema = bb.ema(d)
        const atr = bb.atr(d)

        return ema - atr - atr
    }

    private readonly yAccessorForEmaMinus3Atr = (d: any) => {
        const {yAccessor = KeltnerChannelSeries.defaultProps.yAccessor} = this.props;

        const bb = yAccessor(d);
        if (bb === undefined) {
            return undefined;
        }

        const ema = bb.ema(d)
        const atr = bb.atr(d)

        return ema - atr - atr - atr
    }
}