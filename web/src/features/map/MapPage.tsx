import * as React from "react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectSecurities } from "../../app/securities/securitiesSlice";
import MapItem from "./MapItem/MapItem";
import "./MapPage.css";

const MapPage = () => {

    const dispatch = useAppDispatch();
    const { securities, selectedSecurityTypeWrapper, sessions, securityInfoMap, security } =
        useAppSelector(selectSecurities);

    const [height, setHeight] = useState<number>(200);

    useEffect(() => {
        updateSize()
        window.addEventListener('resize', updateSize)

        // Specify how to clean up after this effect:
        return function cleanup() {
            window.removeEventListener('resize', updateSize)
        }
    }, []);

    const updateSize = () => {
        setHeight(window.innerHeight - 27)
    }

    return (
        <div id="map-page" className="p-grid" style={{ height: height }}>
            {
                securities.map(sec => <MapItem 
                    key={sec.id} 
                    security={sec} 
                    selected={sec.id === security?.id} 
                    className="p-col-2" 
                    height={46} 
                    evening={securityInfoMap.get(sec.id).eveningSession} />)
            }
        </div>
    )
};

export default MapPage;