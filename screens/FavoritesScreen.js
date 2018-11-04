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
      items: [],
      storage: [],
      quotes: "",
      test: '',
      k: 0,
      test2: '',
      date: Date.now(),
      favorites: [],
      online: true,
    }
  }
  static navigationOptions = {
    title: 'Избранные цитаты'
  }
  willFocusSubscription = this.props.navigation.addListener(
    'willFocus',
    payload => {
      this.getFavs();
    }
  );
  getQuotes(){
    console.log('get quotes');
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
        } else {
          console.log('its error, go offline')
          this.setState(state => {
            return {
              ...state,
              quotes: API_URL + `/favorites?items=[${this.state.favorites}]`
            }
          })
          AsyncStorage.getItem('cache_quotes_list', (err, value) => {
            console.log('cache_quotes_list', value)
            if (!!value){
              console.log('offline quotes here )', value)
              offline_quotes = JSON.parse(value);
              state_quotes = [];
              this.state.favorites.forEach(el => {
                offline_quotes.forEach(el2 => {
                  if (el == el2.id){
                    state_quotes.push(el2);
                  }
                });
              })
              this.setState({
                quotes: state_quotes,
                online: false,
              })
            }
          });
        }
    };
    request.open('GET', API_URL + `/favorites?items=[${this.state.favorites}]`);
    request.send();
  }
  getFavs(){
    AsyncStorage.getItem('Favorites', (err,value) => {
      console.log('getfavs value', value)
      if (value && value.length){
        this.setState(state => {
          return {
            ...state,
            favorites: JSON.parse(value),
            storage: value,
            quotes: 'loading',
          }
        });
        if (value != '[]'){
          this.getQuotes();
        } else {
          this.setState(state => {
            return {
              ...state,
              favorites: [],
              storage: '[]',
              quotes: [],
            }
          });
        }
      } else {
        this.setState(state => {
          return {
            ...state,
            favorites: [],
            storage: '[]',
            quotes: [],
          }
        });
      }
    });
  }
  componentWillMount(){
    this.getFavs();
  }
  _keyExtractor = (item) => item.text_short + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    render() {
      console.log('render stata', this.state)
      let comp;
      if (this.state.quotes instanceof Array && this.state.quotes.length){
        comp = (
          <SafeAreaView style={{flex: 1, backgroundColor: '#F5FCFF', paddingBottom: 10, paddingTop: 10}}>
            <FlatList
              data={this.state.quotes}
              renderItem={({item}) => (
                <TouchableOpacity onPress={() => this.props.navigation.navigate('Details', {quote_id: item.id, text_short: item.text_short, title: item.title, text: item.text, online: this.state.online, author_name: item.author_name} )}>
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
          </SafeAreaView>
        )
      } else if (this.state.quotes == 'loading'){
        comp =(
          <View style={styles.container}>
            <Text>Загрузка..</Text>
          </View>
        )
      } else {
        comp =(
          <View style={styles.container}>
            <Text>Нет избранных</Text>
          </View>
        )
      }
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