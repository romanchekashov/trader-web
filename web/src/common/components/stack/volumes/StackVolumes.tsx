import * as React from "react";
import { SecurityVolume } from "./data/SecurityVolume";
import "./StackVolumes.css";

type Props = {
    volumes: SecurityVolume[]
};

const StackVolumes: React.FC<Props> = ({ volumes }) => {

    const createVolumesView = () => {
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
                            <div className="volume-value">{value.volume.volume}</div>
                            <div className="volume-sell" style={{ width: value.sellWidth + '%' }}></div>
                            <div className="volume-buy" style={{ width: value.buyWidth + '%' }}></div>
                        </div>
                    </div>
                );
            });
    };

    return (
        <div className="p-grid volumes">
            <div className="p-col-12" style={{ height: '100%', fontSize: '12px' }}>
                {createVolumesView()}
            </div>
        </div>
    )
};

export default StackVolumes;