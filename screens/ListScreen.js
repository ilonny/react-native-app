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
  static navigationOptions = {
    title: 'Список цитат'
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
        if (value != '[]'){
          this.getQuotes();
        }
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
  _keyExtractor = (item) => item.text_short;
  render() {
    console.log(this.state)
    let comp;    
    let quotes = Array.from(this.state.quotes);
    quotes = [...new Set(quotes)];
    if (this.state.storage != '[]'){
      comp = (
        <SafeAreaView style={{flex: 1, backgroundColor: '#F5FCFF', paddingBottom: 10, paddingTop: 10}}>
        {/* <View style={styles.container}> */}
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
                <TouchableOpacity onPress={() => this.props.navigation.navigate('Details')}>
                  <View style={styles.row}>
                    <View style={{maxWidth: '80%'}}>
                      <Text style={{color: 'tomato', fontWeight: 'bold'}}>{item.title}</Text>
                      <Text style={{marginTop: 10}}>{item.text_short}</Text>
                      <Text style={{marginTop: 10, color: '#c5c5c5', fontStyle: 'italic'}}>{item.author_name}</Text>
                    </View>
                    <View>
                      <Ionicons name="ios-arrow-forward" size={25} color="tomato"/>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={this._keyExtractor}
            >
            </FlatList>
        {/* </View> */}
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