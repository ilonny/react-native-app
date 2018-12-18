const initialState = {
    news: {
        items: [
            {
                title: "Новость 1"
            },
            {
                title: "Новость 2"
            },
            {
                title: "Новость 3"
            }
        ],
        loading: false,
        query_string: ""
    }
};

const siteReducer = function(state = initialState, action) {
    switch (action.type) {
        default:
            return state;
    }
};
export default siteReducer;
