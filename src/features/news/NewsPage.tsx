import * as React from "react";
import {useEffect, useState} from "react";
import "./NewsPage.css"
import {News} from "../../common/components/news/News";

export const NewsPage = () => {
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
        <div id="news-page" className="p-grid" style={{height: height}}>
            <News/>
        </div>
    )
};