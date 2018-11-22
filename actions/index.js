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