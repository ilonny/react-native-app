import React, { Component } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    View,
    AsyncStorage,
    SafeAreaView,
    ScrollView,
    FlatList,
    TouchableOpacity,
    Dimensions,
    Animated,
    TextInput,
    Image,
    ActivityIndicator,
    Picker,
    WebView,
    Linking
} from "react-native";
import { connect } from "react-redux";
import { listStyles } from "../constants/list_styles";
import { API_URL } from "../constants/api";
import Pagination, { Icon, Dot } from "react-native-pagination"; //{Icon,Dot} also available
class CalendarScreen extends Component {
    // static navigationOptions = {
    //     header: null
    // };
    state = {
        page: 1,
        q_str: "",
        city: "moscow",
        items: [],
        loading: true,
        error_counter: 0,
    };
    getCalendarData(city = "moscow", lang = "ru") {
        let request = new XMLHttpRequest();
        request.onreadystatechange = e => {
            if (request.status === 200) {
                try {
                    this.setState({
                        loading: false,
                        items: request.responseText
                            ? JSON.parse(request.responseText)
                            : []
                    });
                    AsyncStorage.setItem(
                        "calendar_cache_" + lang,
                        request.responseText
                    );
                } catch (error) {}
            } else {
                // console.log("error req", request);
                // if (!request.responseText && this.state.error_counter) {
                //     try {
                //         AsyncStorage.getItem(
                //             "calendar_cache_" + lang,
                //             (err, cache) => {
                //                 if (cache) {
                //                     this.setState({
                //                         loading: false,
                //                         items: JSON.parse(cache)
                //                     });
                //                 }
                //             }
                //         );
                //     } catch (error) {}
                // } else {
                //     this.setState({error_counter: 1})
                // }
            }
            setTimeout(() => {
                let todayIndex;
                let today = new Date();
                let dd = today.getDate();
                let mm = today.getMonth() + 1;
                let yyyy = today.getFullYear();
                if (dd < 10) {
                    dd = "0" + dd;
                }
                if (mm < 10) {
                    mm = "0" + mm;
                }
                today = yyyy + "-" + mm + "-" + dd;
                // console.log("today", today);
                this.state.items.forEach((item, index) => {
                    if (item.date.toString() < today.toString()) {
                        todayIndex = index;
                    }
                });
                // console.log("todayIndex", todayIndex);
                try {
                    if (todayIndex) {
                        this.refs.scrollToIndex({
                            animated: true,
                            index: todayIndex
                        });
                    }    
                } catch (error) {}
            }, 250);
        };

        request.open(
            "GET",
            API_URL + `/get-ecadash-calendar?city=${city}&lang=${lang}`
        );
        console.log(
            "req url",
            API_URL + `/get-ecadash-calendar?city=${city}&lang=${lang}`
        );
        request.send();
    }
    shouldComponentUpdate(prevProps, prevState) {
        if (prevState.items.length != this.state.items.length) {
            return true;
        }
        return false;
    }
    componentDidUpdate() {
        // setTimeout(() => {
        //     AsyncStorage.getItem('c_date', (err, c_date) => {
        //         if (c_date && c_date != ''){
        //             this.props.sceneProps.jumpTo("calendar");
        //             AsyncStorage.setItem('c_date', '');        
        //         }
        //     })
        // }, 1);
        if (this.props.sceneProps.route.needRedirectCalendar) {
            this.props.sceneProps.jumpTo("calendar");
        }
    }
    componentDidMount() {
        // this.props.getCalendar(this.state.city);
        // setTimeout(() => {
        //     AsyncStorage.getItem('c_date', (err, c_date) => {
        //         if (c_date && c_date != ''){
        //             this.props.sceneProps.jumpTo("calendar");
        //             AsyncStorage.setItem('c_date', '');        
        //         }
        //     })
        // }, 250);
        if (this.props.sceneProps.route.needRedirectCalendar) {
            this.props.sceneProps.jumpTo("calendar");
        }
        AsyncStorage.getItem("ecadash_city_chosen", (err, city) => {
            if (!city) {
                city = "moscow";
            }
            AsyncStorage.getItem("lang", (err, lang) => {
                if (!lang) {
                    lang = "ru";
                }
                if (lang == "eng") {
                    lang = "en";
                }
                this.getCalendarData(city, lang);
            });
        });
    }
    _keyExtractor = item => (item.date ? item.date.toString() : "");
    renderItem = ({ item }) => {
        // console.log("item", item);
        return (
            <View style={listStyles.quoteItem}>
                <Text style={listStyles.quoteTitle}>{item.date_format}</Text>
                <Text>
                    {item.tithi_str && item.tithi_str + "\n"}
                    {item.shv_str && item.shv_str + "\n"}
                    {item.festivals_str && item.festivals_str + "\n"}
                    {item.holy_days_str && item.holy_days_str + "\n"}
                    {item.notes_str && item.notes_str}
                </Text>
            </View>
        );
    };
    getItemLayout = (data, index) => ({
        length: 150,
        offset: 150 * index,
        index
    });
    render() {
        // console.log("calendar props", this.props);
        // console.log("calendar state", this.state);
        if (this.state.loading) {
            return (
                <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator />
                </SafeAreaView>
            );
        } else {
            return (
                <SafeAreaView
                    style={{
                        flex: 1,
                        backgroundColor: "#efefef"
                    }}
                >
                    <FlatList
                        style={{
                            paddingLeft: 10,
                            paddingRight: 10,
                            paddingBottom: 5,
                            paddingTop: 5,
                            flex: 0
                        }}
                        // initialScrollIndex={36}
                        data={this.state.items}
                        ref={r => (this.refs = r)}
                        onViewableItemsChanged={this.onViewableItemsChanged} //need this
                        renderItem={this.renderItem}
                        keyExtractor={this._keyExtractor}
                        getItemLayout={this.getItemLayout}
                        refreshing={false}
                    />
                    {this.state.items.length > 1 && (
                        <Pagination
                            // dotThemeLight //<--use with backgroundColor:"grey"
                            listRef={this.refs} //to allow React Native Pagination to scroll to item when clicked  (so add "ref={r=>this.refs=r}" to your list)
                            paginationVisibleItems={
                                this.state.viewableItems
                                    ? this.state.viewableItems
                                    : []
                            } //needs to track what the user sees
                            paginationItems={
                                this.state.items ? this.state.items : []
                            } //pass the same list as data
                            paginationItemPadSize={3} //num of items to pad above and below your visable items
                            // pagingEnabled={true}
                            paginationStyle={{
                                width: 10,
                                alignItems: "center",
                                justifyContent: "space-between",
                                position: "absolute",
                                margin: 0,
                                bottom: 0,
                                right: 15,
                                padding: 0,
                                top: 0,
                                flex: 1
                            }}
                            dotIconSizeActive={10}
                        />
                    )}
                </SafeAreaView>
            );
        }
    }
}
const mapStateToProps = state => {
    return {
        calendar: state.siteReducer.calendar
    };
};
const mapDispatchToProps = dispatch => {
    return {
        getCalendar: city => dispatch(getCalendar(city))
    };
};

const styles = StyleSheet.create({
    select: {
        flex: 1,
        borderRadius: 5
    },
    option: {
        flex: 1,
        width: 250
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CalendarScreen);
