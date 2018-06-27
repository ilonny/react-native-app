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
  WebView,
  TouchableHighlight
} from 'react-native';
import { API_URL } from '../constants/api';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default class DetailsScreen extends Component {
    constructor(props){
      super(props);
      this.state = {
      }
    }
    static navigationOptions = {
        headerRight: (
            <TouchableHighlight>
                <Ionicons name="ios-heart-outline" size={25} color="tomato" style={{marginTop: 5}}/>
            </TouchableHighlight>
        ),
        title: 'test',
        headerStyle: {
            paddingRight: 10,
        }
    }
    render(){
        console.log('detailsscreen props', this.props)
        const quote_id = this.props.navigation.getParam('quote_id', 'null');
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#F5FCFF', paddingBottom: 10, paddingTop: 10}}>
                <WebView source={{uri: API_URL + `/quote?id=${quote_id}`}}
                />
            </SafeAreaView>
        )
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