import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Animated,
  Modal,
  StatusBar,
  AsyncStorage,
  TouchableOpacity,
  FlatList,
  SafeAreaView
} from 'react-native';
import { API_URL } from '../constants/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNFetchBlob from 'rn-fetch-blob'

export default class AudioScreen extends Component {
    constructor(props){
      super(props);
      this.state = {
        books: [],
        date: Date.now(),
        refreshnig: false,
        book_id: this.props.navigation.getParam("book_id"),
        downloaded_books: [],
      }
    }
    static navigationOptions = ({navigation}) => {
        const bookName = navigation.getParam('book_name')
        return {
            headerTitle: bookName
        }
    }
    getBooks(){
        console.log('getBooks starts')
        let request = new XMLHttpRequest();
        request.onreadystatechange = (e) => {
            if (request.status === 200) {
                this.setState(state => {
                  if (request.responseText){
                    let parsedText;
                    try {
                      parsedText = JSON.parse(request.responseText);
                    } catch (e){
                      console.log('catched parse json', request)
                      parsedText = [];
                    }
                    return {
                        ...state,
                        books: parsedText
                    }
                }
                })
            }
        };
        request.open('GET', API_URL + `/get-audio-files?book_id=${this.state.book_id}`);
        request.send();
    }
    componentWillMount(){
        this.getBooks();
    }
    // shouldComponentUpdate(nextProps, nextState){
    //     if (this.state.books.length == nextState.books.length){
    //         return false;
    //     }
    //     return true;
    // }
    _keyExtractor = (item) => item.name + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    checkDownloaded(){

    }
    downloadBook(file_id){
        console.log('start downloading', file_id)
        RNFetchBlob
            .config({
                // add this option that makes response data to be stored as a file,
                // this is much more performant.
                fileCache : true,
                appendExt : 'mp3'
            })
            .fetch('GET', API_URL + `/get-audio-file?id=${file_id}`, {
                //some headers ..
            })
            // listen to download progress event
            .progress((received, total) => {
                console.log('progress', received / total)
            })
            .then((res) => {
                // the temp file path
                console.log('The file saved to ', res.path())
                let new_downloaded_books = this.state.downloaded_books
                new_downloaded_books.push({
                    id: file_id,
                    file_path:  res.path(),
                });
                this.setState({
                    downloaded_books: new_downloaded_books
                });
                AsyncStorage.setItem('downloaded_audio', JSON.stringify(this.state.downloaded_books));
            })
    }
    componentDidMount(){
        // this.downloadBook(2)
        AsyncStorage.getItem('downloaded_audio', (err,value) => {
            console.log('from async storage', value);
            if (value){
                this.setState({
                    downloaded_books: JSON.parse(value)
                })
            }
        })
        // AsyncStorage.clear();
    }
    render(){
        console.log('audio details render', this.state);
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#F5FCFF', paddingBottom: 10, paddingTop: 10}}>
                <FlatList
                    data={this.state.books}
                    renderItem={({item}) => {
                        let audioAction;
                        let flag = false;
                        this.state.downloaded_books.forEach(el => {
                            if (el.id == item.id){
                                flag = true;
                            }
                        })
                        if (flag){
                            audioAction = <TouchableOpacity onPress={() => console.log('play action')}><Text>Play</Text></TouchableOpacity>
                        } else {
                            audioAction = <TouchableOpacity onPress={() => this.downloadBook(item.id)}><Text>Download</Text></TouchableOpacity>
                        }
                        return (
                            <View style={styles.row}>
                                <View>
                                    <Text style={{color: 'tomato', fontWeight: 'bold'}}>{item.name}</Text>
                                    {item.description && <Text style={{marginTop: 10}}>{item.description}</Text>}
                                </View>
                                <View>
                                    {audioAction}
                                </View>
                            </View>
                        )
                    }}
                    keyExtractor={this._keyExtractor}
                    onRefresh={() => this.getBooks()}
                    refreshing={false}
                >
                </FlatList>
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