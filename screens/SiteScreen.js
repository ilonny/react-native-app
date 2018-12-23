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
import SiteScreenDetail from "./SiteScreenDetail";

const NewsRoute = () => <SiteScreenDetail type="content" />;
const LookRoute = () => <SiteScreenDetail type="look" />;
const ListenRoute = () => <SiteScreenDetail type="listen" />;
const ReadRoute = () => <SiteScreenDetail type="read" />;

export default class SiteScreen extends Component {
    static navigationOptions = {
        header: null
    };
    state = {
        index: 0,
        routes: [
            { key: "news", title: "Новости" },
            { key: "look", title: "Смотреть" },
            { key: "listen", title: "Слушать" },
            { key: "read", title: "Читать" },
            { key: "read", title: "Читать" }
        ]
    };
    _handleIndexChange = index => this.setState({ index });

    // _renderTabBar = props => {
    //     const inputRange = props.navigationState.routes.map((x, i) => i);
    //     return (
    //         <View style={styles.tabBar}>
    //             {props.navigationState.routes.map((route, i) => {
    //                 const color = props.position.interpolate({
    //                     inputRange,
    //                     outputRange: inputRange.map(inputIndex =>
    //                         inputIndex === i ? "#D6356C" : "#222"
    //                     )
    //                 });
    //                 return (
    //                     <TouchableOpacity
    //                         style={styles.tabItem}
    //                         onPress={() => this.setState({ index: i })}
    //                     >
    //                         <Animated.Text style={[{color}]}>
    //                             {route.title}
    //                         </Animated.Text>
    //                     </TouchableOpacity>
    //                 );
    //             })}
    //         </View>
    //     );
    // };
    _renderTabBar = props => (
        <TabBar
            {...props}
            scrollEnabled
            indicatorStyle={styles.indicator}
            style={styles.tabbar}
            tabStyle={styles.tab}
            labelStyle={styles.label}
        />
    );

    _renderScene = SceneMap({
        news: NewsRoute,
        look: LookRoute,
        listen: ListenRoute,
        read: ReadRoute
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
        width: 120
    },
    indicator: {
        backgroundColor: "#75644f"
    },
    label: {
        color: "#75644f",
        fontWeight: "400"
    }
});
