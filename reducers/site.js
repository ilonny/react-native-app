const initialState = {
    refreshing: false,
    read: {
        items: [],
        loading: false,
        query_string: "",
        page: 1
    },
    content: {
        items: [],
        loading: false,
        query_string: "",
        page: 1
    },
    look: {
        items: [],
        loading: false,
        query_string: "",
        page: 1
    },
    listen: {
        items: [],
        loading: false,
        query_string: "",
        page: 1
    },
    important: {
        items: [],
        loading: false,
        query_string: "",
        page: 1
    },
    calendar: {
        items: [],
        loading: false,
        query_string: "",
        page: 1,
        city: "moscow",
        month: ""
    },
    tag: false
};

const uniqArrOfObjsNews = arr => {
    ret = arr.filter(
        (thing, index, self) => index === self.findIndex(t => t.ID === thing.ID)
    );
    // let end_btn_index;
    // ret.find((el, ind) => {
    // });
    ret.forEach((el, index) => {
        // console.log(el, index);
        if (el.type == "end") {
            ret.splice(index, 1);
        }
    });
    ret.push({
        type: "end",
        NAME: "end_of_list"
    });
    return ret;
};

const siteReducer = function(state = initialState, action) {
    switch (action.type) {
        case "START_GET_ITEMS":
            // console.log("start get items reducer");
            return {
                ...state,
                refreshing: true
            };
        case "SUCCESS_GET_ITEMS":
            // console.log("SUCCESS_GET_ITEMS", action.items_type, action.page);
            let items;
            switch (action.items_type) {
                case "content":
                    // console.log("content items", action.items);
                    if (action.action_type == "add") {
                        items = uniqArrOfObjsNews(
                            state.content.items.concat(action.items)
                        );
                        // console.log("content items 2", items);
                    } else {
                        items = uniqArrOfObjsNews([].concat(action.items));
                        // console.log("content items 3", items);
                    }
                    return {
                        ...state,
                        refreshing: false,
                        content: {
                            ...state.content,
                            items: [...new Set(items)],
                            page: action.page
                        }
                    };
                case "read":
                    if (action.action_type == "add") {
                        items = uniqArrOfObjsNews(
                            state.read.items.concat(action.items)
                        );
                    } else {
                        items = uniqArrOfObjsNews([].concat(action.items));
                    }
                    return {
                        ...state,
                        refreshing: false,
                        read: {
                            ...state.read,
                            items: [...new Set(items)],
                            page: action.page
                        }
                    };
                case "look":
                    if (action.action_type == "add") {
                        items = uniqArrOfObjsNews(
                            state.look.items.concat(action.items)
                        );
                    } else {
                        items = uniqArrOfObjsNews([].concat(action.items));
                    }
                    return {
                        ...state,
                        refreshing: false,
                        look: {
                            ...state.look,
                            items: [...new Set(items)],
                            page: action.page
                        }
                    };
                case "listen":
                    if (action.action_type == "add") {
                        items = uniqArrOfObjsNews(
                            state.listen.items.concat(action.items)
                        );
                    } else {
                        items = uniqArrOfObjsNews([].concat(action.items));
                    }
                    return {
                        ...state,
                        refreshing: false,
                        listen: {
                            ...state.listen,
                            items: [...new Set(items)],
                            page: action.page
                        }
                    };
                case "important":
                    // console.log('action items important', action.items)
                    items = [].concat(action.items);
                    // console.log('action items important 2', items)
                    return {
                        ...state,
                        refreshing: false,
                        important: {
                            ...state.important,
                            items: [...new Set(items)],
                            page: action.page
                        }
                    };
                default:
                    return state;
            }
        case "SUCCESS_GET_CALENDAR":
            items = [].concat(action.items);
            return {
                ...state,
                refreshing: false,
                calendar: {
                    ...state.calendar,
                    items: [...new Set(items)]
                }
            };
        case "SET_TAG":
        console.log('SET_TAG Reducer', action)
            return {
                ...state,
                tag: action.tag
            };
        default:
            return state;
    }
};
export default siteReducer;
