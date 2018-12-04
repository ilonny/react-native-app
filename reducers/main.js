const initialState = {
	audio: {
        globalDownloading: {
            enable: false,
            book_name: '',
        },
        need_to_download: [],
        downloading_book: {
            id:0,
            progress:0,
        },
        downloaded_books: [],
        progress: {},
        task: {},
	}
}

const mainReducer = function (state = initialState, action) {
	switch(action.type) {
		case "SET_NEED_TO_DOWNLOAD":
			return {
				...state,
				audio: {
                    ...state.audio,
					need_to_download: action.need_to_download
				}
            }
        case "SET_DOWNLOADING_BOOK":
			return {
				...state,
				audio: {
                    ...state.audio,
					downloading_book: action.downloading_book
				}
            }
        case "SET_DOWNLOAD_TASK":
			return {
				...state,
				audio: {
                    ...state.audio,
					task: action.download_task
				}
            }
        case "SET_DOWNLOADED_BOOKS":
			return {
				...state,
				audio: {
                    ...state.audio,
					downloaded_books: action.downloaded_books
				}
            }
        case "SET_GLOBAL_DOWNLOADING":
			return {
				...state,
				audio: {
                    ...state.audio,
					globalDownloading: action.global_downloading
				}
			}
		default:
			return state
	}
}

export default mainReducer