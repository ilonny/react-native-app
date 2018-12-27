import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  AsyncStorage,
  PushNotificationIOS,
  Alert
} from 'react-native';
import { createBottomTabNavigator, createStackNavigator } from 'react-navigation';
import ListScreen from './screens/ListScreen';
import SettingsScreen from './screens/SettingsScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import DetailsScreen from './screens/DetailsScreen';
import ReaderScreen from './screens/ReaderScreen';
import ReaderScreenDetail from './screens/ReaderScreenDetail';
import AudioScreen from './screens/AudioScreen';
import AudioDetail from './screens/AudioDetail';
import SiteScreen from './screens/SiteScreen';
import SiteScreenDetail from './screens/SiteScreenDetail';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_URL } from './constants/api';
import NavigationService from './NavigationService';
import { Provider } from 'react-redux';
import configureStore from './store'
const store = configureStore();
var PushNotification = require('react-native-push-notification');
PushNotification.configure({

  // (optional) Called when Token is generated (iOS and Android)
  onRegister: function(token) {
      console.log( 'TOKEN:', token );
      AsyncStorage.setItem('Token', JSON.stringify(token));
      let request = new XMLHttpRequest();
        request.onreadystatechange = (e) => {
            if (request.readyState !== 4) {
              return;
            }
            if (request.status === 200) {
                
            }
        };
        request.open('GET', API_URL + `/set-token?token=${JSON.stringify(token)}&settings=all`);
        request.send();
        console.log(API_URL + `/set-token?token=${JSON.stringify(token)}&settings=all`);
  },

  // (required) Called when a remote or local notification is opened or received
  onNotification: function(notification) {
      console.log( 'NOTIFICATION:', JSON.stringify(notification) );
      // process the notification
      // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
      notification.finish(PushNotificationIOS.FetchResult.NoData);
      if (notification.data.need_alert){
        setTimeout(() => {
          Alert.alert(notification.message);
        }, 500);
      } else if (notification.data.quote_id){
        let q_id = notification.data.quote_id;
        NavigationService.navigate('Details', {quote_id: q_id});
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
  requestPermissions: true,
});

// const instructions = Platform.select({
//   ios: 'Press Cmd+R to reload,\n' +
//     'Cmd+D or shake for dev menu',
//   android: 'Double tap R on your keyboard to reload,\n' +
//     'Shake or press menu button for dev menu',
// });
const ListStack = createStackNavigator({
  Цитаты: ListScreen,
  Details: DetailsScreen,
  Settings: SettingsScreen
});
const FavoritesStack = createStackNavigator({
  Избранное: FavoritesScreen,
  Details: DetailsScreen,
});
// const SettingsStack = createStackNavigator({
//   Настройки: SettingsScreen,
// });
const ReaderStack = createStackNavigator({
  Книги: ReaderScreen,
  Reader: ReaderScreenDetail,
});
const AudioStack = createStackNavigator({
  Аудиокниги: AudioScreen,
  Audio: AudioDetail
});
const SiteStack = createStackNavigator({
  SiteTabScreen: SiteScreen,
  SiteDetail: SiteScreenDetail,
});
const TopLevelNavigator = createBottomTabNavigator(
  {
    Harekrishna: SiteStack,
    Цитаты: ListStack,
    Избранное: FavoritesStack,
    Книги: ReaderStack,
    Аудиокниги: AudioStack,
    // Настройки: SettingsStack,
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, tintColor }) => {
        const { routeName } = navigation.state;
        let iconName;
        if (routeName === 'Цитаты') {
          iconName = `ios-list${focused ? '' : '-outline'}`;
        } else if (routeName === 'Настройки') {
          iconName = `ios-options${focused ? '' : '-outline'}`;
        } else if (routeName === 'Избранное') {
          iconName = `ios-star${focused ? '' : '-outline'}`;
        } else if (routeName === 'Книги') {
          iconName = `ios-book${focused ? '' : '-outline'}`;
        } else if (routeName === 'Аудиокниги') {
          iconName = `ios-headset${focused ? '' : '-outline'}`;
        } else if (routeName === 'Harekrishna') {
          iconName = `ios-globe${focused ? '' : '-outline'}`;
        }
        // You can return any component that you like here! We usually use an
        // icon component from react-native-vector-icons
        return <Ionicons name={iconName} size={routeName === 'Цитаты' ? 35 : 25} color={tintColor} />;
      },
      tapBarLabel: (props) =>{
        console.log('tapBarLabel', props)
        return '123'
      },
      headerTitle: navigation.state.routeName,
    }),
    tabBarOptions: {
      activeTintColor: 'tomato',
      inactiveTintColor: 'gray',
    },
  }
);

export default class App extends Component {
  render(){
    return (
      <Provider store={store} >
        <TopLevelNavigator
          ref={navigatorRef => {
            NavigationService.setTopLevelNavigator(navigatorRef);
          }}
        />
      </Provider>
    )
  }
}