import React, { Component } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    View,
    AsyncStorage,
    PushNotificationIOS,
    Alert
} from "react-native";
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
    Цитаты: {
        screen: ListScreen,
        navigationOptions: {
            title: 'Quotes'
        }
    },
    Details: DetailsScreen,
    Favorites: {
        screen: FavoritesScreen,
        navigationOptions: {
            title: 'Favorites quotes'
        }
    }
});
const ReaderStack = createStackNavigator({
    Книги: {
        screen: ReaderScreen,
        navigationOptions: {
          title: "Books"
        }
      },
    Reader: ReaderScreenDetail
});
const AudioStack = createStackNavigator({
    Аудиокниги: {
        screen: AudioScreen,
        navigationOptions: {
            title: "Audiobooks"
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
                title: 'scsmath.com'
            }
        },
        Quotes: {
            screen: ListStack,
            navigationOptions: {
                title: 'Quotes'
            }
        },
        Books: {
            screen: ReaderStack,
            navigationOptions: {
                title: 'Books'
            }
        },
        Books: ReaderStack,
        Audiobooks: AudioStack,
        Settings: SettingsMainScreen
        // Настройки: SettingsStack,
    },
    {
        navigationOptions: ({ navigation }) => ({
            tabBarIcon: ({ focused, tintColor }) => {
                const { routeName } = navigation.state;
                let iconName;
                if (routeName === "Quotes") {
                    iconName = `ios-list${focused ? "" : "-outline"}`;
                } else if (routeName === "Settings") {
                    iconName = `ios-options${focused ? "" : "-outline"}`;
                } else if (routeName === "Избранное") {
                    iconName = `ios-star${focused ? "" : "-outline"}`;
                } else if (routeName === "Books") {
                    iconName = `ios-book${focused ? "" : "-outline"}`;
                } else if (routeName === "Audiobooks") {
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

export default class AppEng extends Component {
    render() {
        console.log("app render");
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