import * as React from "react";
import {MoexOpenInterest} from "../../../common/data/open-interest/MoexOpenInterest";

type Props = {
    moexOpenInterest: MoexOpenInterest
};

export const MoexOpenInterestView: React.FC<Props> = ({moexOpenInterest}) => {

    if (moexOpenInterest) {
        return (
            <div className="p-col-6">
                <table className="contract-open-positions">
                    <tbody>
                    <tr>
                        <th rowSpan={2}>Открытые позиции</th>
                        <th colSpan={2} className="white-border-column">Физические лица</th>
                        <th colSpan={2} className="white-border-column">Юридические лица</th>
                        <th rowSpan={2}>Итого</th>
                    </tr>
                    <tr>
                        <th>Длинные</th>
                        <th>Короткие</th>
                        <th>Длинные</th>
                        <th>Короткие</th>
                    </tr>
                    <tr>
                        <td>Открытые позиции</td>
                        <td className="text_right">{moexOpenInterest.fizPosLong.toLocaleString()}</td>
                        <td className="text_right">{moexOpenInterest.fizPosShort.toLocaleString()}</td>
                        <td className="text_right">{moexOpenInterest.yurPosLong.toLocaleString()}</td>
                        <td className="text_right">{moexOpenInterest.yurPosShort.toLocaleString()}</td>
                        <td className="text_right">{moexOpenInterest.posTotal.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td>Изменение</td>
                        <td className="text_right">{moexOpenInterest.changeFizPosLong
                            ? moexOpenInterest.changeFizPosLong.toLocaleString() : null}</td>
                        <td className="text_right">{moexOpenInterest.changeFizPosShort
                            ? moexOpenInterest.changeFizPosShort.toLocaleString() : null}</td>
                        <td className="text_right">{moexOpenInterest.changeYurPosLong
                            ? moexOpenInterest.changeYurPosLong.toLocaleString() : null}</td>
                        <td className="text_right">{moexOpenInterest.changeYurPosShort
                            ? moexOpenInterest.changeYurPosShort.toLocaleString() : null}</td>
                        <td className="text_right">{moexOpenInterest.changePosTotal
                            ? moexOpenInterest.changePosTotal.toLocaleString() : null}</td>
                    </tr>
                    <tr>
                        <td>Количество лиц</td>
                        <td className="text_right">{moexOpenInterest.fizPosLongHolders.toLocaleString()}</td>
                        <td className="text_right">{moexOpenInterest.fizPosShortHolders.toLocaleString()}</td>
                        <td className="text_right">{moexOpenInterest.yurPosLongHolders.toLocaleString()}</td>
                        <td className="text_right">{moexOpenInterest.yurPosShortHolders.toLocaleString()}</td>
                        <td className="text_right">{moexOpenInterest.posHoldersTotal.toLocaleString()}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        )
    } else {
        return null
    }
};