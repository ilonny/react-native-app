import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';

export default class FavoritesScreen extends Component {
  constructor(){
    super();
    this.state = {

    }
  }
  static navigationOptions = {
    title: 'Избранные цитаты'
  }
    render() {
      return (
        <View>
          <Text>Favorites screen</Text>
        </View>
      );
    }
  }