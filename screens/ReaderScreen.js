import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  AsyncStorage,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { API_URL } from '../constants/api';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default class FavoritesScreen extends Component {
    constructor(props){
        super(props);
        this.state = {
        }
    }
    static navigationOptions = {
        title: 'Книги'
    }
    willFocusSubscription = this.props.navigation.addListener(
        'willFocus',
        payload => {
        console.log('will focus reader is fired');
        }
    );
    _keyExtractor = (item) => item.text_short + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    render() {
        console.log('render reader state', this.state)
        let comp;
        comp = (
            <SafeAreaView style={{flex: 1, backgroundColor: '#F5FCFF', paddingBottom: 10, paddingTop: 10}}>
                <View style={styles.container}>
                    <Text>Читалка здесь</Text>
                </View>
            </SafeAreaView>
        )
        return (
            comp
        );
    }
}

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F5FCFF',
    },
    row: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 10,
      paddingTop: 25,
      paddingBottom: 25,
      borderBottomWidth: 1, 
      borderBottomColor: '#eaeaea'
    }
  })