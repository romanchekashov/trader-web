import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const fetchNews = createAsyncThunk(
    'news/fetch',
    async (provider?: NewsProvider, secId?: number) => {
        const response: NewsItem[] = await getNews(provider, secId);
        return response;
    }
)

export const NewsPageSlice = createSlice({
    name: 'news',
    initialState: {
        news: [],
    },
    reducers: {
        getNews: (state, action) => {
            state.news += action.payload;
        }
    },
    extraReducers: {
        [fetchNews]: (state, action) {
            state.news.push(action.payload);
        }
    }
})

export const {getNews} = NewsPageSlice,actions;
