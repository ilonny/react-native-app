export const toggleSidebar = (currentPos) => {
    return {
        type: "TOGGLE_SIDEBAR",
        currentPos
    }
}
export const setNeedToDownload = need_to_download => {
    return {
        type: "SET_NEED_TO_DOWNLOAD",
        need_to_download
    }
}

export const setDownloadingBook = downloading_book => {
    return {
        type: "SET_DOWNLOADING_BOOK",
        downloading_book
    }
}

export const setDownloadTask = download_task => {
    return {
        type: "SET_DOWNLOAD_TASK",
        download_task
    }
}

export const setDownloadedBooks = downloaded_books => {
    console.log('SET_DOWNLOADED_BOOKS action')
    return {
        type: "SET_DOWNLOADED_BOOKS",
        downloaded_books
    }
}

export const setGlobalDownloading = global_downloading => {
    return {
        type: "SET_GLOBAL_DOWNLOADING",
        global_downloading
    }
}
export const setNowPlaying = (playing, track_id, track_name, track_duration, toc_id, whoosh) => {
    return {
        type: "SET_NOW_PLAYING",
        playing,
        track_id,
        track_name,
        track_duration,
        toc_id,
        whoosh
    }
}