import moment = require("moment");
import * as React from "react";
import { DATE_FORMAT, TIME_FORMAT } from "../../../utils/utils";
import { AnonymousTrade } from "./data/AnonymousTrade";
import { SecurityVolume } from "./data/SecurityVolume";
import { SecurityVolumeWrapper } from "./data/SecurityVolumeWrapper";
import "./StackVolumes.css";

type Props = {
    volumesWrapper: SecurityVolumeWrapper[]
    className?: string
};

const StackVolumes: React.FC<Props> = ({ volumesWrapper, className = "" }) => {

    const highVolumeTradesView = (highVolumeTrades: AnonymousTrade[]) => {
        if (!highVolumeTrades.length) return (<></>);

        const maxVolume = highVolumeTrades.reduce((acc, val, idx) => val.qty > acc ? val.qty : acc, 0);

        return highVolumeTrades
            .map(({ trade_num, price, qty, sell, datetime }) => {
                const volumeWidth = qty * 100 / maxVolume;
                
                return (
                    <div key={trade_num} className="volume">
                        <div className="volume-price">{price}</div>
                        <div className="volume-volume">
                            <div className="volume-value">
                                <div>{moment(datetime).format("HH:mm")}</div>
                                <div>{qty}</div>
                            </div>
                            <div className={`volume-${sell ? 'sell' : 'buy'}`} style={{ width: volumeWidth + '%' }}></div>
                        </div>
                    </div>
                );
            });
    };

    const createVolumesView = (volumes: SecurityVolume[]) => {
        if (!volumes.length) return (<></>);

        const maxVolume = volumes
            .sort((a, b) => b.volume - a.volume)[0].volume;

        let visibleVolumes = volumes
            .sort((a, b) => b.price - a.price)
            .map(volume => {
                const volumeWidth = volume.volume * 100 / maxVolume;
                const buyWidth = volume.buyVolume * 100 / maxVolume;
                const sellWidth = volumeWidth - buyWidth;

                return {
                    volumeWidth,
                    volume,
                    buyWidth,
                    sellWidth
                };
            });

        let minVolumeWidth = 25;
        let minVolumeWidthItirationStep = 5;
        let filtered = [];

        while (filtered.length < 10 && minVolumeWidth > 0) {
            filtered = visibleVolumes.filter(value => value.volumeWidth > minVolumeWidth);
            if (minVolumeWidth === minVolumeWidthItirationStep) minVolumeWidthItirationStep = 1;
            minVolumeWidth -= minVolumeWidthItirationStep;
        };

        return filtered
            .map(value => {
                return (
                    <div key={value.volume.price} className="volume">
                        <div className="volume-price">{value.volume.price}</div>
                        <div className="volume-volume">
                            <div className="volume-value">
                                <div></div>
                                <div>{value.volume.volume}</div>
                            </div>
                            <div className="volume-sell" style={{ width: value.sellWidth + '%' }}></div>
                            <div className="volume-buy" style={{ width: value.buyWidth + '%' }}></div>
                        </div>
                    </div>
                );
            });
    };

    return (
        <div className={`p-grid ${className} volumes`}>
            {
                volumesWrapper.map(({ volumes, secCode, date, highVolumeTrades }) => {
                    return (
                        <div key={secCode + date.getTime()} className="p-col-12" style={{ fontSize: '12px' }}>
                            <div>{moment(date).format(DATE_FORMAT)}</div>
                            {highVolumeTradesView(highVolumeTrades)}
                            <br />
                            {createVolumesView(volumes)}
                        </div>
                    )
                })
            }
        </div>
    )
};

export default StackVolumes;