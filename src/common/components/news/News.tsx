import * as React from "react";
import {useEffect, useState} from "react";
import "./News.css"
import {NewsItem} from "../../data/news/NewsItem";
import {getNews} from "../../api/rest/newsRestApi";
import moment = require("moment");

type Props = {
    secId?: number
    onItemSelected?: (item: NewsItem) => void
}

export const News: React.FC<Props> = ({secId, onItemSelected}) => {
    const [items, setItems] = useState<NewsItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<NewsItem>(null);
    const [height, setHeight] = useState<number>(200);
    const FETCH_NEWS_TIMEOUT = 5 * 60000

    useEffect(() => {
        updateSize()
        window.addEventListener('resize', updateSize)

        fetchNews()
        const setIntervalIdToFetchNews = setInterval(() => {
            fetchNews()
        }, FETCH_NEWS_TIMEOUT)

        // Specify how to clean up after this effect:
        return function cleanup() {
            window.removeEventListener('resize', updateSize)
            clearInterval(setIntervalIdToFetchNews)
        }
    }, [secId]);

    const fetchNews = () => {
        getNews(null, secId)
            .then(events => {
                setItems(events)
                if (events.length > 0) setSelectedItem(events[0])
            })
    }

    const updateSize = () => {
        setHeight(window.innerHeight - 27)
    }

    const formatNews = (item: NewsItem) => {
        const published = moment(item.timestamp).format("DD-MM-YYYY HH:mm");

        return (
            <>
                <h3>{item.title}</h3>
                <p>Pub: {published} by {item.newsProvider} <a href={item.href} target="_blank">{item.href}</a></p>
                {
                    selectedItem.html ?
                        <>
                            <p dangerouslySetInnerHTML={{__html: selectedItem.brief}}></p>
                            <div dangerouslySetInnerHTML={{__html: selectedItem.text}}></div>
                        </>
                        :
                        <>
                            <p>{selectedItem.brief}</p>
                            <div>{selectedItem.text}</div>
                        </>
                }
            </>
        )
    }

    return (
        <div id="news" className="p-grid" style={{height: height}}>
            <div className="p-col-6" style={{height: "100%", overflowY: "scroll"}}>
                {
                    items.map((shareEvent, index) => {
                        const published = moment(shareEvent.timestamp).format("DD-MM-YYYY HH:mm");
                        const isSelected = selectedItem && shareEvent.title === selectedItem.title
                            && shareEvent.timestamp.getTime() === selectedItem.timestamp.getTime()
                            && shareEvent.newsProvider === selectedItem.newsProvider

                        let className = "news-item"
                        if (isSelected) {
                            className += " news-item-selected"
                        } else if (index % 2 === 0) {
                            className += " news-item-even"
                        }

                        return (
                            <div className={className}
                                 onClick={(e) => setSelectedItem(shareEvent)}>
                                <div className="news-item-pub">Pub: {published} by {shareEvent.newsProvider}</div>
                                <div className="news-item-title">{shareEvent.title}</div>
                            </div>
                        )
                    })
                }
            </div>
            <div className="p-col-6">
                {
                    selectedItem ? formatNews(selectedItem) : null
                }
            </div>
        </div>
    )
};