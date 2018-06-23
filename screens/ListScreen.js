import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  AsyncStorage,
  SafeAreaView,
  ScrollView,
  FlatList
} from 'react-native';
import { API_URL } from '../constants/api';

export default class ListScreen extends Component {
  constructor(props){
    super(props);
    this.state = {
      items: [],
      storage: [],
      quotes: "",
      test: '',
      k: 0,
      test2: '',
      date: Date.now()
    }
  }
  willFocusSubscription = this.props.navigation.addListener(
    'willFocus',
    payload => {
      this.getSettings();
    }
  );
  getQuotes(){
    let request = new XMLHttpRequest();
    request.onreadystatechange = (e) => {
        if (request.readyState !== 4) {
          return;
        }
        if (request.status === 200) {
          this.setState(state => {
            return {
              ...state,
              quotes: request.responseText ? JSON.parse(request.responseText) : 'error network'
              // quotes: 'error network 200'
            }
          })
        } else {
          this.setState(state => {
            return {
              ...state,
              quotes: API_URL + `/quotes?items=[${this.state.items}]`
            }
          })
        }
    };
    request.open('GET', API_URL + `/quotes?items=[${this.state.items}]`);
    request.send();
  }
  getSettings(){
    AsyncStorage.getItem('Settings', (err,value) => {
      if (value.length){
        this.setState(state => {
          return {
            ...state,
            items: JSON.parse(value),
            storage: value,
            test: 'Comp will mount here',
            date: Date.now()
          }
        });
        this.getQuotes();
      }
    });
  }
  componentWillMount(){
    this.getSettings();
  }

  // componentDidUpdate(prevProps){
  //   setTimeout(() => {
  //     AsyncStorage.getItem('Settings', (err,value) => {
  //       if (JSON.stringify(this.state.items) != value){
  //         this.setState(state => {
  //           return {
  //             ...state,
  //             test: 'didUpdate',
  //             // test2: this.state.items != JSON.parse(value) ? 'true' : 'false'
  //             test2: JSON.stringify(this.state.items) == value ? 'true' : 'false'
  //           }
  //         });
  //       }
  //     })
  //   }, 2000);
  // }
  _keyExtractor = (item) => +item.id;
  render() {
    let comp;
    // let { quotes } = this.state;
    console.log('CONSOLLLLEEEE', this.state.quotes)
    let quotes = Array.from(this.state.quotes);
    console.log(quotes)
    if (this.state.items != '[]'){
      comp = (
        <SafeAreaView style={{flex: 1, backgroundColor: '#F5FCFF'}}>
        <View style={styles.container}>
          <ScrollView>
            {/* <Text>Items here</Text>
            <Text>Items: {(this.state.items)}</Text>
            <Text>Item1: {(this.state.items[0])}</Text>
            <Text>Storage: {(this.state.storage)}</Text>
            <Text>Test: {(this.state.test)}</Text>
            <Text>Test2: {(this.state.test2)}</Text>
            <Text>Date: {Date.now()}</Text> */}
            {/* <Text>{ typeof quotes }</Text> */}
            <FlatList
              data={quotes}
              renderItem={({item}) => (
                <Text>{item.title}</Text>
              )}
              keyExtractor={this._keyExtractor}
            >
            </FlatList>
          </ScrollView>
        </View>
        </SafeAreaView>
      );
    } else {
      comp = (
        <View style={styles.container}>
          <Text style={{textAlign: 'center'}}>Пожалуйста, укажите желаемые источники в разделе "Настройки"</Text>
        </View>
      )
    }
    return comp;
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
})