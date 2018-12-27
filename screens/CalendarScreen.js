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
    WebView
} from "react-native";
import { connect } from "react-redux";
import { listStyles } from "../constants/list_styles";
import { getCalendar } from "../actions/site";

class CalendarScreen extends Component {
    // static navigationOptions = {
    //     header: null
    // };
    state = {
        page: 1,
        q_str: "",
        city: "moscow"
    };
    _getOptionList() {
        return this.refs["OPTIONLIST"];
    }
    _select(value) {
        this.setState({
            city: value
        });
        setTimeout(() => {
            this.props.getCalendar(this.state.city);
        }, 100);
    }
    componentDidMount() {
        // this.props.getCalendar(this.state.city);
    }
    render() {
        console.log("calendar props", this.props);
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: "#efefef"
                }}
            >
                <WebView
                    source={{
                        uri:
                            "https://harekrishna.ru/mobile-api/get-calendar-html.php?city=moscow"
                    }}
                />
            </SafeAreaView>
        );
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
