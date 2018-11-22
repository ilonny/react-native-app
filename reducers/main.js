const initialState = {
	audio: {
        globalDownloading: {
            enable: false,
            book_name: '',
        },
        need_to_download: [],
        downloading_books: [],
	}
}

const mainReducer = function (state = initialState, action) {
	switch(action.type) {
		case "SET_NEED_TO_DOWNLOAD":
			return {
				...state,
				audio: {
					need_to_download: action.need_to_download
				}
			}
		default:
			return state
	}
}

export default mainReducer