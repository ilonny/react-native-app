import React, { Component } from "react";
import { Platform, StyleSheet, Text, View, AsyncStorage } from "react-native";
import {
    createBottomTabNavigator,
    createStackNavigator
} from "react-navigation";
import ListScreen from "./screens/ListScreen";
import SettingsScreen from "./screens/SettingsScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import DetailsScreen from "./screens/DetailsScreen";
import ReaderScreen from "./screens/ReaderScreen";
import ReaderScreenDetail from "./screens/ReaderScreenDetail";
import AudioScreen from "./screens/AudioScreen";
import AudioDetail from "./screens/AudioDetail";
import SiteScreen from "./screens/SiteScreen";
import SiteScreenDetail from "./screens/SiteScreenDetail";
import SettingsMainScreen from "./screens/SettingsMainScreen";
import Ionicons from "react-native-vector-icons/Ionicons";
import { API_URL } from "./constants/api";
import NavigationService from "./NavigationService";
import { Provider } from "react-redux";
import configureStore from "./store";
const store = configureStore();
require("es6-object-assign").polyfill();
// import 'babel-polyfil'
setTimeout(() => {
    console.log("SETTIMEOUT");
    Platform.select({
        // ios: () => require('./pushIOS'),
        android: require("./pushAndroid")
    });
}, 600);
// const instructions = Platform.select({
//   ios: 'Press Cmd+R to reload,\n' +
//     'Cmd+D or shake for dev menu',
//   android: 'Double tap R on your keyboard to reload,\n' +
//     'Shake or press menu button for dev menu',
// });
const ListStack = createStackNavigator({
    Цитаты: ListScreen,
    Details: DetailsScreen,
    Settings: SettingsScreen,
    Цитаты: {
        screen: ListScreen,
        navigationOptions: {
            title: "Цитаты"
        }
    },
    Details: DetailsScreen,
    Favorites: {
        screen: FavoritesScreen,
        navigationOptions: {
            title: "Избранные цитаты"
        }
    }
});
const ReaderStack = createStackNavigator({
    Книги: ReaderScreen,
    Reader: ReaderScreenDetail,
    Книги: {
        screen: ReaderScreen,
        navigationOptions: {
            title: "Книги"
        }
    },
    Reader: ReaderScreenDetail
});
const AudioStack = createStackNavigator({
    Аудиокниги: {
        screen: AudioScreen,
        navigationOptions: {
            title: "Аудиокниги"
        }
    },
    Audio: AudioDetail
});
const SiteStack = createStackNavigator({
    SiteTabScreen: SiteScreen,
    SiteDetail: SiteScreenDetail
});
let TopLevelNavigator = createBottomTabNavigator(
    {
        Harekrishna: {
            screen: SiteStack,
            navigationOptions: {
                title: "harekrishna.ru"
            }
        },
        Цитаты: {
            screen: ListStack,
            navigationOptions: {
                title: "Цитаты"
            }
        },
        // Избранное: FavoritesStack,
        Книги: ReaderStack,
        Аудиокниги: AudioStack,
        Настройки: SettingsMainScreen
        // Настройки: SettingsStack,
    },
    {
        navigationOptions: ({ navigation }) => ({
            tabBarIcon: ({ focused, tintColor }) => {
                const { routeName } = navigation.state;
                let iconName;
                if (routeName === "Цитаты") {
                    iconName = `ios-list${focused ? "" : "-outline"}`;
                } else if (routeName === "Настройки") {
                    iconName = `ios-options${focused ? "" : "-outline"}`;
                } else if (routeName === "Избранное") {
                    iconName = `ios-star${focused ? "" : "-outline"}`;
                } else if (routeName === "Книги") {
                    iconName = `ios-book${focused ? "" : "-outline"}`;
                } else if (routeName === "Аудиокниги") {
                    iconName = `ios-headset${focused ? "" : "-outline"}`;
                } else if (routeName === "Harekrishna") {
                    iconName = `ios-globe${focused ? "" : "-outline"}`;
                }
                // You can return any component that you like here! We usually use an
                // icon component from react-native-vector-icons
                return (
                    <Ionicons
                        name={iconName}
                        size={routeName === "Цитаты" ? 35 : 25}
                        color={tintColor}
                    />
                );
            },
            headerTitle: navigation.state.routeName
        }),
        tabBarOptions: {
            activeTintColor: "tomato",
            inactiveTintColor: "gray"
            // showLabel: false,
        }
    }
);

export default class App extends Component {
    render() {
        console.log("render lol");
        return (
            <Provider store={store}>
                <TopLevelNavigator
                    ref={navigatorRef => {
                        NavigationService.setTopLevelNavigator(navigatorRef);
                    }}
                />
            </Provider>
        );
    }
}
