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

export default class ReaderScreen extends Component {
  constructor(props){
    super(props);
    this.state = {
      books: [],
      date: Date.now(),
      refreshnig: false,
    }
  }
  static navigationOptions = {
    title: 'Книги'
  }
  willFocusSubscription = this.props.navigation.addListener(
    'willFocus',
    payload => {
        this.getBooks();
    }
  );
  _keyExtractor = (item) => item.text_short + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  getBooks(){
    console.log('getBooks starts')
    let request = new XMLHttpRequest();
    request.onreadystatechange = (e) => {
        if (request.status === 200) {
            this.setState(state => {
                if (request.responseText){
                    return {
                        ...state,
                        books: JSON.parse(request.responseText)
                    }
                }
            })
        }
    };
    request.open('GET', API_URL + `/get-reader-books`);
    request.send();
  }
  componentWillMount(){
      this.getBooks();
  }
  shouldComponentUpdate(nextProps, nextState){
      if (this.state.books.length == nextState.books.length){
          return false;
      }
      return true;
  }
  render() {
    console.log('render', this.state)
    let comp;
    if (true) {
      comp = (
        <SafeAreaView style={{flex: 1, backgroundColor: '#F5FCFF', paddingBottom: 10, paddingTop: 10}}>
            <FlatList
              data={this.state.books}
              renderItem={({item}) => (
                <TouchableOpacity onPress={() => this.props.navigation.navigate('Reader', {book_id: item.id, book_name: item.name, book_src: item.file_src} )}>
                  <View style={styles.row}>
                    <View style={{maxWidth: '80%'}}>
                      <Text style={{color: 'tomato', fontWeight: 'bold'}}>{item.name}</Text>
                      <Text style={{marginTop: 10}}>{item.description}</Text>
                      <Text style={{marginTop: 10, color: '#c5c5c5', fontStyle: 'italic'}}>{item.author}</Text>
                    </View>
                    <View>
                      <Ionicons name="ios-arrow-forward" size={25} color="tomato"/>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={this._keyExtractor}
              onRefresh={() => this.getBooks()}
              refreshing={false}
            >
            </FlatList>
        </SafeAreaView>
      );
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