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
    Picker
} from "react-native";
import { connect } from "react-redux";
import { listStyles } from "../constants/list_styles";
import { getCalendar } from "../actions/site";
import NavigationService from "../NavigationService";
import DropDown, { Select, Option, OptionList } from "react-native-selectme";

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
            this.props.getCalendar(this.state.city)    
        }, 100);
    }
    componentDidMount(){
        this.props.getCalendar(this.state.city)
    }
    render() {
        console.log('calendar props', this.props)
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: "#efefef"
                }}
            >
                <View
                    style={[
                        listStyles.quoteItem,
                        {
                            marginLeft: 10,
                            marginRight: 10,
                            marginBottom: 5,
                            marginTop: 5,
                            flex: 0,
                            padding: 8,
                            flexDirection: "row",
                            alignItems: "center"
                        }
                    ]}
                >
                    <Text>Выбор города: {this.state.canada}</Text>
                    <Select
                        style={styles.select}
                        ref="SELECT1"
                        optionListRef={this._getOptionList.bind(this)}
                        defaultValue="Москва"
                        onSelect={this._select.bind(this)}
                    >
                        <Option style={styles.option} value={"moscow"}>
                            Москва
                        </Option>
                        <Option style={styles.option} value={"spb"}>
                            Санкт - Петербург
                        </Option>
                        <Option style={styles.option} value={"kiev"}>
                            Киев
                        </Option>
                        <Option style={styles.option} value={"spb"}>
                            Санкт - Петербург
                        </Option>
                        <Option style={styles.option} value={"khabarovsk"}>
                            Хабаровск
                        </Option>
                        <Option style={styles.option} value={"common"}>
                            Общий
                        </Option>
                    </Select>
                </View>
                <OptionList
                    ref="OPTIONLIST"
                    overlayStyles={{ backgroundColor: "#efefef", flex: 0 }}
                    itemsStyles={{ flex: 1, width: 300 }}
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
