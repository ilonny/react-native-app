const initialState = {
    audio: {
        globalDownloading: {
            enable: false,
            book_name: ""
        },
        need_to_download: [],
        downloading_book: {
            id: 0,
            progress: 0
        },
        downloaded_books: [],
        progress: {},
        task: {}
    },
    now_playing: {
        playing: false,
        track_id: null,
        track_name: null,
        track_duration: null,
        toc_id: null,
        whoosh: {}
    },
    lang: "ru"
};

const mainReducer = function(state = initialState, action) {
    switch (action.type) {
        case "SET_NEED_TO_DOWNLOAD":
            return {
                ...state,
                audio: {
                    ...state.audio,
                    need_to_download: action.need_to_download
                }
            };
        case "SET_DOWNLOADING_BOOK":
            return {
                ...state,
                audio: {
                    ...state.audio,
                    downloading_book: action.downloading_book
                }
            };
        case "SET_DOWNLOAD_TASK":
            return {
                ...state,
                audio: {
                    ...state.audio,
                    task: action.download_task
                }
            };
        case "SET_DOWNLOADED_BOOKS":
            return {
                ...state,
                audio: {
                    ...state.audio,
                    downloaded_books: action.downloaded_books
                }
            };
        case "SET_GLOBAL_DOWNLOADING":
            return {
                ...state,
                audio: {
                    ...state.audio,
                    globalDownloading: action.global_downloading
                }
            };
        case "SET_NOW_PLAYING":
            console.log("SET_NOW_PLAYING", action);
            return {
                ...state,
                now_playing: {
                    ...state.now_playing,
                    playing: action.playing,
                    track_id: action.track_id,
                    track_name: action.track_name,
                    track_duration: action.track_duration,
                    toc_id: action.toc_id,
                    whoosh: action.whoosh
                }
            };
        case "SET_LANG":
            return {
                ...state,
                lang: action.lang
            };
        default:
            return state;
    }
};

export default mainReducer;