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
import { listStyles } from '../constants/list_styles';
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
      date: Date.now(),
      refreshnig: false,
    }
  }
  static navigationOptions = {
    title: 'Цитаты'
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
      if (value && value.length){
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
      } else {
        this.setState(state => {
          return {
            ...state,
            // storage: '[]',
            items: 'all'
          }
        });
        this.getQuotes();
      }
    });
  }
  componentWillMount(){
    this.getSettings();
  }

  _keyExtractor = (item) => item.text_short + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  refresh(){
    this.setState(state => {
      return {
        ...state,
        refreshing: true,
      }
    })
    let request = new XMLHttpRequest();
    request.onreadystatechange = (e) => {
        if (request.readyState !== 4) {
          return;
        }
        if (request.status === 200) {
          this.setState(state => {
            return {
              ...state,
              quotes: request.responseText ? JSON.parse(request.responseText) : 'error network',
              refreshing: false
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
  render() {
    let comp;    
    let quotes = this.state.quotes;
    quotes = [...new Set(quotes)];
    if (this.state.storage != '[]'){
      comp = (
        <SafeAreaView style={{flex: 1, backgroundColor: '#efefef'}}>
            <FlatList
              style={{paddingLeft: 10, paddingRight: 10, paddingBottom: 5, paddingTop: 5}}
              data={quotes}
              renderItem={({item}) => (
                <TouchableOpacity onPress={() => this.props.navigation.navigate('Details', {quote_id: item.id, text_short: item.text_short, title: item.title} )}>
                  <View style={listStyles.quoteItem}>
                    <Text style={listStyles.quoteTitle}>{item.title}</Text>
                    <View style={listStyles.quoteBottom}>
                      <View style={listStyles.quoteBottomText}>
                        {item.text_short && (<Text style={{color: "#808080"}}>{item.text_short}</Text>)}
                        <Text style={{marginTop: 10, color: '#c5c5c5', fontStyle: 'italic'}}>{item.author_name}</Text>
                      </View>
                      <View style={listStyles.arrowCircle}>
                        <View style={listStyles.arrowCircleInside}>
                          <Ionicons name="ios-arrow-forward" size={40} color="#fff"/>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={this._keyExtractor}
              onRefresh={() => this.refresh()}
              refreshing={false}
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