import { Accordion, AccordionTab } from "primereact/accordion";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchNews, selectNews } from "../../../features/news/NewsSlice";
import { NewsItem } from "../../data/news/NewsItem";
import "./News.css";
import moment = require("moment");

type Props = {
  secId?: number;
  onItemSelected?: (item: NewsItem) => void;
  height?: number;
};

export const News: React.FC<Props> = ({
  secId,
  onItemSelected,
  height = 200,
}) => {
  const { news } = useAppSelector(selectNews);
  const dispatch = useAppDispatch();

  const ref = useRef(null);
  const [selectedItem, setSelectedItem] = useState<NewsItem>(null);
  const FETCH_NEWS_TIMEOUT = 5 * 60000;

  useEffect(() => {
    getNews(secId);
    const setIntervalIdToFetchNews = setInterval(() => {
      getNews(secId);
    }, FETCH_NEWS_TIMEOUT);

    // Specify how to clean up after this effect:
    return function cleanup() {
      clearInterval(setIntervalIdToFetchNews);
    };
  }, [secId]);

  useEffect(() => {
    if (news.length > 0) setSelectedItem(news[0]);
  }, [news]);

  const getNews = (secId: number) => {
    dispatch(fetchNews({ provider: null, secId }));
  };

  const formatNews = (item: NewsItem) => {
    const published = moment(item.timestamp).format("DD-MM-YYYY HH:mm");
    const { title, newsProvider, href, html, brief, text } = item;

    return (
      <>
        <h3>{title}</h3>
        <p>
          Pub: {published} by {newsProvider}{" "}
          <a href={href} target="_blank">
            Read more
          </a>
        </p>
        {html ? (
          <>
            <p
              dangerouslySetInnerHTML={{
                __html: brief,
              }}
            ></p>
            <div
              dangerouslySetInnerHTML={{
                __html: text,
              }}
            ></div>
          </>
        ) : (
          <>
            <p>{brief}</p>
            <div>{text}</div>
          </>
        )}
      </>
    );
  };

  const formatNewsSmall = (item: NewsItem) => {
    const published = moment(item.timestamp).format("DD-MM-YYYY HH:mm");
    const { title, newsProvider, href, html, brief, text } = item;

    return (
      <>
        {html ? (
          <>
            <div
              dangerouslySetInnerHTML={{
                __html: brief,
              }}
            ></div>
            <span>
              {" "}
              <a href={href} target="_blank">
                Read more
              </a>
            </span>
            <div
              dangerouslySetInnerHTML={{
                __html: text,
              }}
            ></div>
          </>
        ) : (
          <>
            <div>
              {brief}
              <span>
                {" "}
                <a href={href} target="_blank">
                  Read more
                </a>
              </span>
            </div>
            <div>{text}</div>
          </>
        )}
      </>
    );
  };

  const mainClassName = ref?.current?.clientWidth < 500 ? "news_sm" : "news_lg";

  return (
    <div
      ref={ref}
      id="news"
      className={`p-grid ${mainClassName}`}
      style={{ height: height }}
    >
      {ref?.current?.clientWidth < 500 ? (
        <Accordion
          className="accordion-custom"
          activeIndex={0}
          style={{ width: "100%" }}
        >
          {news.map((shareEvent, index) => {
            const published = moment(shareEvent.timestamp).format(
              "DD-MM-YYYY HH:mm"
            );
            const isSelected =
              selectedItem &&
              shareEvent.title === selectedItem.title &&
              shareEvent.timestamp.getTime() ===
                selectedItem.timestamp.getTime() &&
              shareEvent.newsProvider === selectedItem.newsProvider;

            const header = (
              <div onClick={(e) => setSelectedItem(shareEvent)}>
                <div className="news-item-pub">
                  Pub: {published} by {shareEvent.newsProvider}
                </div>
                <div className="news-item-title">{shareEvent.title}</div>
              </div>
            );

            return (
              <AccordionTab key={index} header={header}>
                {formatNewsSmall(shareEvent)}
              </AccordionTab>
            );
          })}
        </Accordion>
      ) : (
        <>
          <div
            className="p-col-6"
            style={{ height: "100%", overflowY: "scroll" }}
          >
            {news.map((shareEvent, index) => {
              const published = moment(shareEvent.timestamp).format(
                "DD-MM-YYYY HH:mm"
              );
              const isSelected =
                selectedItem &&
                shareEvent.title === selectedItem.title &&
                shareEvent.timestamp.getTime() ===
                  selectedItem.timestamp.getTime() &&
                shareEvent.newsProvider === selectedItem.newsProvider;

              let className = "news-item";
              if (isSelected) {
                className += " news-item-selected";
              } else if (index % 2 === 0) {
                className += " news-item-even";
              }

              return (
                <div
                  key={index}
                  className={className}
                  onClick={(e) => setSelectedItem(shareEvent)}
                >
                  <div className="news-item-pub">
                    Pub: {published} by {shareEvent.newsProvider}
                  </div>
                  <div className="news-item-title">{shareEvent.title}</div>
                </div>
              );
            })}
          </div>
          <div className="p-col-6">
            {selectedItem ? formatNews(selectedItem) : null}
          </div>
        </>
      )}
    </div>
  );
};
