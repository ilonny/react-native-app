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
      online: true,
      pages_count: 0,
      current_page: 1,
    }
  }
  static navigationOptions = {
    title: 'Цитаты'
  }
  willFocusSubscription = this.props.navigation.addListener(
    'willFocus',
    payload => {
      this.state.online && this.getSettings();
    }
  );
  getQuotes(){
    console.log('get quotes start')
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
              online: true
              // quotes: 'error network 200'
            }
          })
          AsyncStorage.setItem('cache_quotes_list', request.responseText);
        } else {
          console.log('error req')
          this.setState(state => {
            return {
              ...state,
              quotes: API_URL + `/quotes?items=[${this.state.items}]`
            }
          })
          AsyncStorage.getItem('cache_quotes_list', (err, value) => {
            // console.log('cache_quotes_list', value)
            if (!!value){
              this.setState({
                quotes: JSON.parse(value),
                online: false,
              })
            }
            this.setPagination();
          });
        }
        this.setPagination();
    };
    request.open('GET', API_URL + `/quotes?items=[${this.state.items}]`);
    request.send();
  }
  setPagination(){
    let quotes_count = this.state.quotes.length;
    this.setState({
      pages_count: Math.ceil(quotes_count/20)
    });
  }
  setPage(page_number){
    this.setState({
      current_page: page_number
    })
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
    this.initialStart();
  }
  componentDidMount(){
    // AsyncStorage.clear();
    console.log('remove global after app start downloading');
    AsyncStorage.removeItem('global_downloading');
  }
  _keyExtractor = (item) => item.text_short + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  refresh(){
    console.log('refresh')
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
              refreshing: false,
              online: true
              // quotes: 'error network 200'
            }
          })
          AsyncStorage.setItem('cache_quotes_list', request.responseText);
        } else {
          this.setState(state => {
            return {
              ...state,
              quotes: API_URL + `/quotes?items=[${this.state.items}]`,
              online: false
            }
          })
          AsyncStorage.getItem('cache_quotes_list', (err, value) => {
            console.log('cache_quotes_list', value)
            if (!!value){
              this.setState({
                quotes: JSON.parse(value),
                online: false,
              })
            }
            this.setPagination();
          });
        }
    };
    request.open('GET', API_URL + `/quotes?items=[${this.state.items}]`);
    request.send();
  }
  //initial start
  initialStart(){
    AsyncStorage.getItem('first_runninig', (err, value) => {
      console.log('first_runninig', value)
      if (!value){
        console.log('getBooks  audio starts')
        let request = new XMLHttpRequest();
        request.onreadystatechange = (e) => {
            if (request.status === 200) {
              // console.log('audio is downloaded'git, request.responseText);
                AsyncStorage.setItem('cached_audio_list', request.responseText);
            } else {
              console.log('error audio is downloaded', API_URL + `/get-audio-books`);
            }
        };
        request.open('GET', API_URL + `/get-audio-books`);
        request.send();
        //
        console.log('getBooks reader starts')
        let request2 = new XMLHttpRequest();
        request2.onreadystatechange = (e) => {
            if (request2.status === 200) {
                AsyncStorage.setItem('cache_reader_list', request2.responseText);
            }
        };
        request2.open('GET', API_URL + `/get-reader-books`);
        request2.send();
      }
    });
  }
  //
  render() {
    let comp;    
    let quotes = this.state.quotes;
    // console.log('render state', this.state)
    quotes = [...new Set(quotes)];
    let pagination_arr = [];
    quotes_on_page = quotes.splice((this.state.current_page-1)*20, 20);
    if (this.state.pages_count){
      for (let i = 1; i <= this.state.pages_count; i++){
        pagination_arr.push(i);
      }
    }
    if (this.state.storage != '[]'){
      comp = (
        <SafeAreaView style={{flex: 1, backgroundColor: '#efefef', justifyContent:'space-between'}}>
            <FlatList
              style={{paddingLeft: 10, paddingRight: 10, paddingBottom: 5, paddingTop: 5, flex: 0}}
              data={quotes_on_page}
              renderItem={({item}) => (
                <TouchableOpacity onPress={() => this.props.navigation.navigate('Details', {quote_id: item.id, text_short: item.text_short, title: item.title, text: item.text, online: this.state.online, author_name: item.author_name} )}>
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
              onRefresh={() => this.state.online && this.refresh()}
              refreshing={false}
            >
            </FlatList>
            {this.state.pages_count && (
              <View style={{backgroundColor: '#fff'}}>
                <FlatList
                  data={pagination_arr}
                  horizontal={true}
                  keyExtractor={(item) => item.toString()}
                  contentContainerStyle={[styles.pagination, {flex: this.state.pages_count > 10 ? 0 : 1}]}
                  renderItem = {({item}) => (
                    <TouchableOpacity key={item} onPress={() => this.setPage(item)}>
                      <View style={{
                        padding: 5,
                        borderRadius: 5,
                        borderWidth: 1,
                        borderColor: 'red',
                        margin: 5,
                        backgroundColor: this.state.current_page == item ? 'red' : 'white',
                      }}>
                        <Text style={{
                          fontSize: 10,
                          color: this.state.current_page == item ? 'white' : 'black',
                        }}>{item}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                >
                </FlatList>
              </View>
            )}
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
    justifyContent: 'space-between',
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
  },
  pagination: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#fff',
  }
})