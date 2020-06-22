import * as React from "react";
import {MoexOpenInterest} from "../../../common/data/MoexOpenInterest";

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
                        <td className="text_right">{moexOpenInterest.openInterestIndividualsLong.toLocaleString()}</td>
                        <td className="text_right">{moexOpenInterest.openInterestIndividualsShort.toLocaleString()}</td>
                        <td className="text_right">{moexOpenInterest.openInterestLegalEntitiesLong.toLocaleString()}</td>
                        <td className="text_right">{moexOpenInterest.openInterestLegalEntitiesShort.toLocaleString()}</td>
                        <td className="text_right">{moexOpenInterest.openInterestTotal.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td>Изменение</td>
                        <td className="text_right">{moexOpenInterest.changeIndividualsLong.toLocaleString()}</td>
                        <td className="text_right">{moexOpenInterest.changeIndividualsShort.toLocaleString()}</td>
                        <td className="text_right">{moexOpenInterest.changeLegalEntitiesLong.toLocaleString()}</td>
                        <td className="text_right">{moexOpenInterest.changeLegalEntitiesShort.toLocaleString()}</td>
                        <td className="text_right">{moexOpenInterest.changeTotal.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td>Количество лиц</td>
                        <td className="text_right">{moexOpenInterest.entitiesWithOpenPositionsIndividualsLong.toLocaleString()}</td>
                        <td className="text_right">{moexOpenInterest.entitiesWithOpenPositionsIndividualsShort.toLocaleString()}</td>
                        <td className="text_right">{moexOpenInterest.entitiesWithOpenPositionsLegalEntitiesLong.toLocaleString()}</td>
                        <td className="text_right">{moexOpenInterest.entitiesWithOpenPositionsLegalEntitiesShort.toLocaleString()}</td>
                        <td className="text_right">{moexOpenInterest.entitiesWithOpenPositionsTotal.toLocaleString()}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        )
    } else {
        return null
    }
};