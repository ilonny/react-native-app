import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  AsyncStorage,
} from 'react-native';
import { createBottomTabNavigator, createStackNavigator } from 'react-navigation';
import ListScreen from './screens/ListScreen';
import SettingsScreen from './screens/SettingsScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import DetailsScreen from './screens/DetailsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';

import NavigationService from './NavigationService'

setTimeout(() => {
  console.log('SETTIMEOUT')
  Platform.select({
    // ios: () => require('./pushIOS'),
    android: require('./pushAndroid'),
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
});
const FavoritesStack = createStackNavigator({
  Избранное: FavoritesScreen,
  Details: DetailsScreen,
});
const SettingsStack = createStackNavigator({
  Настройки: SettingsScreen,
});

const TopLevelNavigator = createBottomTabNavigator(
  {
    Цитаты: ListStack,
    Избранное: FavoritesStack,
    Настройки: SettingsStack,
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
        }
        // You can return any component that you like here! We usually use an
        // icon component from react-native-vector-icons
        return <Ionicons name={iconName} size={25} color={tintColor} />;
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
      <TopLevelNavigator
        ref={navigatorRef => {
          NavigationService.setTopLevelNavigator(navigatorRef);
        }}
      />
    )
  }
}