import { SITE_URL } from "../constants/api";
export const startGetItems = () => {
    return {
        type: "START_GET_ITEMS"
    };
};
export const successGetItems = (items, items_type, page, q_str, action_type) => {
    console.log("successGetItems", items);
    return {
        type: "SUCCESS_GET_ITEMS",
        items,
        items_type,
        page,
        q_str,
        action_type
    };
};
export const errorGetItems = () => {
    return {
        type: "ERROR_GET_ITEMS"
    };
};
export const getItems = (type, page = 1, q_str = '', action_type) => {
    return dispatch => {
        dispatch(startGetItems);
        console.log("get items start with type: ", type, "page: ", page, "q_str: ", q_str, "action_type", action_type);
        let request = new XMLHttpRequest();
        request.onreadystatechange = e => {
            if (request.status === 200) {
                try {
                    //если это был поиск, то нужно заменять результаты поиска, а если нет то дополнять страницы - поэтому разные экшены
                    dispatch(successGetItems(JSON.parse(request.responseText), type, page, q_str, action_type));
                } catch (e) {
                    console.log("err", e);
                }
            } else {
                console.log("error get items", request);
                dispatch(errorGetItems);
            }
        };
        request.open(
            "GET",
            SITE_URL + `/get-list.php?type=${type}&page=${page}&q=${q_str}`
        );
        request.send();
    };
};
