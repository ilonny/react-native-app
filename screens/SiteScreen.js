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
    Animated
} from "react-native";
import { TabView, TabBar, SceneMap } from "react-native-tab-view";
import SiteScreenList from "./SiteScreenList";
import CalendarScreen from "./CalendarScreen";

const ContentRoute = () => <SiteScreenList type="content" />;
const LookRoute = () => <SiteScreenList type="look" />;
const ListenRoute = () => <SiteScreenList type="listen" />;
const ReadRoute = () => <SiteScreenList type="read" />;
const ImportantRoute = () => <SiteScreenList type="important" />;
const CalendarRoute = () => <CalendarScreen />;

export default class SiteScreen extends Component {
    static navigationOptions = {
        header: null
    };
    state = {
        index: 0,
        routes: [
            { key: "calendar", title: "Вайшнавский календарь" },
            { key: "content", title: "Новости" },
            { key: "look", title: "Смотреть" },
            { key: "listen", title: "Слушать" },
            { key: "read", title: "Читать" },
            { key: "important", title: "Это важно" },
        ]
    };
    _handleIndexChange = index => this.setState({ index });

    _renderTabBar = props => (
        <TabBar
            {...props}
            scrollEnabled
            indicatorStyle={styles.indicator}
            style={styles.tabbar}
            tabStyle={styles.tab}
            labelStyle={styles.label}
            renderLabel={this._renderLabel}
        />
    );
    _renderLabel = route => {
        // console.log('route', route.route)
        return (
            <Text
                style={styles.label}
                numberOfLines={route.route.title == 'Вайшнавский календарь' ? 2 : 1}
                ellipsizeMode='tail'
            >
               {route.route.title}
            </Text>
        );
    };
    _renderScene = SceneMap({
        content: ContentRoute,
        look: LookRoute,
        listen: ListenRoute,
        read: ReadRoute,
        important: ImportantRoute,
        calendar: CalendarRoute,
    });
    render() {
        return (
            <TabView
                navigationState={this.state}
                renderScene={this._renderScene}
                renderTabBar={this._renderTabBar}
                onIndexChange={this._handleIndexChange}
            />
        );
    }
}
// const styles = StyleSheet.create({
//     container: {
//         flex: 1
//     },
//     tabBar: {
//         flexDirection: "row",
//         paddingTop: 10,
//         backgroundColor: "#f7f7f7",
//         borderBottomColor: "#CFCFD0",
//         borderBottomWidth: 1
//     },
//     tabItem: {
//         flex: 0,
//         alignItems: "center",
//         padding: 16
//     }
// });

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    tabbar: {
        paddingTop: 13,
        backgroundColor: "#f7f7f7"
    },
    tab: {
        width: 120,
        // flex: 1,
    },
    indicator: {
        backgroundColor: "#75644f"
    },
    label: {
        color: "#75644f",
        fontWeight: "400",
        padding: 0,
        textAlign: 'center'
        // flex: 1,
    }
});
