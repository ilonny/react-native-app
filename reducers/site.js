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
    let end_btn_index;
    ret.find((el, ind) => {
        console.log(el.type);
        if (el.type == "end") {
            end_btn_index = ind;
        }
    });
    console.log("end_btn_index", end_btn_index);
    ret.splice(end_btn_index, 1);
    ret.push({
        type: "end",
        NAME: "end_of_list"
    });
    return ret;
};

const siteReducer = function(state = initialState, action) {
    switch (action.type) {
        case "SUCCESS_GET_ITEMS":
            console.log("SUCCESS_GET_ITEMS", action.items_type, action.page);
            let items;
            switch (action.items_type) {
                case "content":
                    if (action.action_type == "add") {
                        items = uniqArrOfObjsNews(
                            state.content.items.concat(action.items)
                        );
                    } else {
                        items = uniqArrOfObjsNews([].concat(action.items));
                    }
                    return {
                        ...state,
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
