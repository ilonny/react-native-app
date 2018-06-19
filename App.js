import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { createBottomTabNavigator } from 'react-navigation';
import ListScreen from './screens/ListScreen';
import SettingsScreen from './screens/SettingsScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';

// const instructions = Platform.select({
//   ios: 'Press Cmd+R to reload,\n' +
//     'Cmd+D or shake for dev menu',
//   android: 'Double tap R on your keyboard to reload,\n' +
//     'Shake or press menu button for dev menu',
// });

export default createBottomTabNavigator(
  {
    Настройки: SettingsScreen,
    Цитаты: ListScreen,
    Избранное: FavoritesScreen,
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, tintColor }) => {
        const { routeName } = navigation.state;
        let iconName;
        if (routeName === 'Цитаты') {
          iconName = `ios-information-circle${focused ? '' : '-outline'}`;
        } else if (routeName === 'Настройки') {
          iconName = `ios-options${focused ? '' : '-outline'}`;
        } else if (routeName === 'Избранное') {
          iconName = `ios-star${focused ? '' : '-outline'}`;
        }
        // You can return any component that you like here! We usually use an
        // icon component from react-native-vector-icons
        return <Ionicons name={iconName} size={25} color={tintColor} />;
      },
    }),
    tabBarOptions: {
      activeTintColor: 'tomato',
      inactiveTintColor: 'gray',
    },
  }
);

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5FCFF',
//   },
//   welcome: {
//     fontSize: 20,
//     textAlign: 'center',
//     margin: 10,
//   },
//   instructions: {
//     textAlign: 'center',
//     color: '#333333',
//     marginBottom: 5,
//   },
// });
