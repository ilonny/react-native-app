import { SITE_URL } from "../constants/api";
export const startGetItems = () => {
    return {
        type: "START_GET_ITEMS"
    };
};
export const successGetItems = (items, items_type, page) => {
    console.log("successGetItems", items);
    return {
        type: "SUCCESS_GET_ITEMS",
        items,
        items_type,
        page
    };
};
export const errorGetItems = () => {
    return {
        type: "ERROR_GET_ITEMS"
    };
};
export const getItems = (type, page = 1) => {
    return dispatch => {
        dispatch(startGetItems);
        console.log("get items start with type: ", type, "page: ", page);
        let request = new XMLHttpRequest();
        request.onreadystatechange = e => {
            if (request.status === 200) {
                try {
                    dispatch(successGetItems(JSON.parse(request.responseText), type, page));
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
            SITE_URL + `/get-list.php?type=${type}&page=${page}`
        );
        request.send();
    };
};
