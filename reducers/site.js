const initialState = {
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
    }
};

const uniqArrOfObjsNews = arr => {
    ret = arr.filter(
        (thing, index, self) => index === self.findIndex(t => t.ID === thing.ID)
    );
    return ret;
};

const siteReducer = function(state = initialState, action) {
    switch (action.type) {
        case "SUCCESS_GET_ITEMS":
            console.log("SUCCESS_GET_ITEMS", action.items_type, action.page);
            let items;
            switch (action.items_type) {
                case "content":
                    items = uniqArrOfObjsNews(
                        state.content.items.concat(action.items)
                    );
                    return {
                        ...state,
                        content: {
                            ...state.content,
                            items: [...new Set(items)],
                            page: action.page
                        }
                    };
                case "read":
                    items = uniqArrOfObjsNews(
                        state.read.items.concat(action.items)
                    );
                    return {
                        ...state,
                        read: {
                            ...state.read,
                            items: [...new Set(items)],
                            page: action.page
                        }
                    };
                case "look":
                    items = uniqArrOfObjsNews(
                        state.look.items.concat(action.items)
                    );
                    return {
                        ...state,
                        look: {
                            ...state.look,
                            items: [...new Set(items)],
                            page: action.page
                        }
                    };
                case "listen":
                    items = uniqArrOfObjsNews(
                        state.listen.items.concat(action.items)
                    );
                    return {
                        ...state,
                        listen: {
                            ...state.listen,
                            items: [...new Set(items)],
                            page: action.page
                        }
                    };
                default:
                    return state;
            }
        default:
            return state;
    }
};
export default siteReducer;
