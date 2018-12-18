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

const FirstRoute = () => <SiteScreenDetail text="test text for component" />;
const SecondRoute = () => (
    <View style={[styles.container, { backgroundColor: "#673ab7" }]} />
);

export default class SiteScreen extends Component {
    static navigationOptions = {
        header: null
    };
    state = {
        index: 0,
        routes: [
            { key: "first", title: "Новости" },
            { key: "second", title: "Second" }
        ]
    };
    _handleIndexChange = index => this.setState({ index });

    _renderTabBar = props => {
        const inputRange = props.navigationState.routes.map((x, i) => i);
        return (
            <View style={styles.tabBar}>
                {props.navigationState.routes.map((route, i) => {
                    const color = props.position.interpolate({
                        inputRange,
                        outputRange: inputRange.map(inputIndex =>
                            inputIndex === i ? "#D6356C" : "#222"
                        )
                    });
                    return (
                        <TouchableOpacity
                            style={styles.tabItem}
                            onPress={() => this.setState({ index: i })}
                        >
                            <Animated.Text style={{ color }}>
                                {route.title}
                            </Animated.Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    _renderScene = SceneMap({
        first: FirstRoute,
        second: SecondRoute
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
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    tabBar: {
        flexDirection: "row",
        paddingTop: 10,
        backgroundColor: "#f7f7f7",
        borderBottomColor: "#CFCFD0",
        borderBottomWidth: 1
    },
    tabItem: {
        flex: 1,
        alignItems: "center",
        padding: 16
    }
});
