import React, { Component } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    View,
    AsyncStorage,
    PushNotificationIOS,
    Alert,
    Dimensions
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
var PushNotification = require("react-native-push-notification");
PushNotification.configure({
    // (optional) Called when Token is generated (iOS and Android)
    onRegister: function(token) {
        let device_settings;
        let device_settings_site;
        AsyncStorage.getItem("Settings", (err, value) => {
            if (value) {
                device_settings = value;
            } else {
                device_settings = "all";
            }
            AsyncStorage.getItem("SiteSettings", (err, value2) => {
                if (value2) {
                    device_settings_site = value2;
                } else {
                    device_settings_site = JSON.stringify([
                        "content",
                        "read",
                        "look",
                        "listen",
                        "important"
                    ]);
                }
                console.log("TOKEN ES:", token);
                AsyncStorage.setItem("Token", JSON.stringify(token));
                let request = new XMLHttpRequest();
                request.onreadystatechange = e => {
                    if (request.readyState !== 4) {
                        return;
                    }
                    if (request.status === 200) {
                    }
                };
                AsyncStorage.getItem("lang", (err, lang) => {
                    request.open(
                        "GET",
                        API_URL +
                            `/set-token?token=${JSON.stringify(
                                token
                            )}&settings=${device_settings}&news_settings=${device_settings_site}&version=3&lang=${lang}`
                    );
                    request.send();
                    console.log(
                        API_URL +
                            `/set-token?token=${JSON.stringify(
                                token
                            )}&settings=${device_settings}&news_settings=${device_settings_site}&version=3&lang=${lang}`
                    );
                });
            });
        });
    },

    // (required) Called when a remote or local notification is opened or received
    onNotification: function(notification) {
        console.log("NOTIFICATION3:", JSON.stringify(notification));
        // process the notification
        // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
        notification.finish(PushNotificationIOS.FetchResult.NoData);
        if (notification.data.need_alert) {
            setTimeout(() => {
                Alert.alert(notification.message);
            }, 500);
        } else if (notification.data.quote_id) {
            let q_id = notification.data.quote_id;
            setTimeout(() => {
                console.log('REDIRECT TIMEOUT')
                NavigationService.navigate("Details", { quote_id: q_id });
              }, 2000);
        } else if (notification.data.news_id) {
            let n_id = notification.data.news_id;
            let n_t = notification.data.news_title;
            setTimeout(() => {
                console.log('REDIRECT TIMEOUT')
                NavigationService.navigate("SiteDetail", { id: n_id, title: n_t });
            }, 2000);
        }
    },

    // ANDROID ONLY: GCM Sender ID (optional - not required for local notifications, but is need to receive remote push notifications)
    senderID: "604004509059",

    // IOS ONLY (optional): default: all - Permissions to register.
    permissions: {
        alert: true,
        badge: true,
        sound: true
    },

    // Should the initial notification be popped automatically
    // default: true
    popInitialNotification: true,

    /**
     * (optional) default: true
     * - Specified if permissions (ios) and token (android and ios) will requested or not,
     * - if not, you must call PushNotificationsHandler.requestPermissions() later
     */
    requestPermissions: true
});

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
            title: "Citas"
        }
    },
    Details: DetailsScreen,
    Favorites: {
        screen: FavoritesScreen,
        navigationOptions: {
            title: "Favoritas citas"
        }
    }
});
const ReaderStack = createStackNavigator({
    Книги: {
        screen: ReaderScreen,
        navigationOptions: {
            title: "Libros"
        }
    },
    Reader: ReaderScreenDetail
});
const AudioStack = createStackNavigator({
    Аудиокниги: {
        screen: AudioScreen,
        navigationOptions: {
            title: "Audiolibros",
            headerBackTitle: " ",
        }
    },
    Audio: AudioDetail
});
const SiteStack = createStackNavigator({
    SiteTabScreen: SiteScreen,
    SiteDetail: SiteScreenDetail
});
const dim = Dimensions.get('window');
let TopLevelNavigator = createBottomTabNavigator(
    {
        Harekrishna: {
            screen: SiteStack,
            navigationOptions: {
                title: "Sitios"
            }
        },
        Citas: {
            screen: ListStack,
            navigationOptions: {
                title: "Citas"
            }
        },
        Libros: {
            screen: ReaderStack,
            navigationOptions: {
                title: "Libros"
            }
        },
        Libros: ReaderStack,
        Audiolibros: AudioStack,
        Ajustes: SettingsMainScreen
        // Настройки: SettingsStack,
    },
    {
        navigationOptions: ({ navigation }) => ({
            tabBarIcon: ({ focused, tintColor }) => {
                const { routeName } = navigation.state;
                let iconName;
                if (routeName === "Citas") {
                    iconName = `ios-list${focused ? "" : "-outline"}`;
                } else if (routeName === "Ajustes") {
                    iconName = `ios-options${focused ? "" : "-outline"}`;
                } else if (routeName === "Избранное") {
                    iconName = `ios-star${focused ? "" : "-outline"}`;
                } else if (routeName === "Libros") {
                    iconName = `ios-book${focused ? "" : "-outline"}`;
                } else if (routeName === "Audiolibros") {
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
            inactiveTintColor: "gray",
            style: (dim.height == 812 || dim.width == 812 || dim.height == 896 || dim.width == 896) ? {
                // marginBottom: 30,
                height: 70,
                backgroundColor: '#f7f7f7',
            } : {
            },
            tabStyle: (dim.height == 812 || dim.width == 812 || dim.height == 896 || dim.width == 896) ? {
                marginBottom: 15,
                height: 50
            } : {
            },
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
