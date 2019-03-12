import { SITE_URL } from "../constants/api";
import { Alert } from "react-native";
import NavigationService from '../NavigationService';
export const startGetItems = () => {
    return {
        type: "START_GET_ITEMS"
    };
};
export const successGetItems = (
    items,
    items_type,
    page,
    q_str,
    action_type
) => {
    // console.log("successGetItems", items);
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
let alertShowed = false;
export const getItems = (type, page = 1, q_str = "", action_type, tag) => {
    // console.log('get items fired', type, page, q_str, action_type, tag);
    if (tag){
        tag = tag.id
    }
    return dispatch => {
        dispatch(startGetItems());
        // console.log("get items start with type: ", type, "page: ", page, "q_str: ", q_str, "action_type", action_type);
        let request = new XMLHttpRequest();
        request.onreadystatechange = e => {
            if (request.status === 200) {
                try {
                    //если это был поиск, то нужно заменять результаты поиска, а если нет то дополнять страницы - поэтому разные экшены
                    dispatch(
                        successGetItems(
                            JSON.parse(request.responseText),
                            type,
                            page,
                            q_str,
                            action_type
                        )
                    );
                } catch (e) {
                    // console.log("err", e);
                }
            } else {
                // console.log("error get items", request);
                setTimeout(() => {
                    if (request.status != 200) {
                        if (!alertShowed){
                            console.log(alertShowed);
                            Alert.alert("Ошибка получения данных");
                            NavigationService.navigate('Цитаты');
                            alertShowed = true;
                        }
                    }
                }, 5000);
                // dispatch(errorGetItems);
            }
        };
        request.open(
            "GET",
            SITE_URL + `/get-list.php?type=${type}&page=${page}&q=${q_str}&tag_id=${tag}`
        );
        request.send();
    };
};
export const successGetCalendar = items => {
    return {
        type: "SUCCESS_GET_CALENDAR",
        items
    }
}
export const getCalendar = city => {
    // console.log('getCalendar fired', city)
    return dispatch => {
        let request = new XMLHttpRequest();
        request.onreadystatechange = e => {
            if (request.status === 200) {
                try {
                    dispatch(
                        successGetCalendar(JSON.parse(request.responseText))
                    );
                } catch (e) {
                    // console.log("err", e);
                }
            } else {
                // console.log("error get items", request);
                setTimeout(() => {
                    if (request.status != 200) {
                        Alert.alert("Ошибка получения данных");
                    }
                }, 1000);
                // dispatch(errorGetItems);
            }
        };
        request.open(
            "GET",
            SITE_URL + `/get-calendar.php?city=${city}`
        );
        request.send();
    };
};

export const setTag = tag => {
    console.log('set tag action', tag)
    return {
        type: "SET_TAG",
        tag
    }
} 