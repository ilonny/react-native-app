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
  SafeAreaView,
  Alert,
  TouchableWithoutFeedback,
  Slider
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
        downloading_books: [],
        isOpenModal: false,
        playingAudio: {},
        playing: false,
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
    downloadBook(file_id){
        console.log('start downloading', file_id)
        let { downloading_books } = this.state;
        downloading_books.push({
            id: file_id,
        });
        let index = downloading_books.length - 1;
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
                downloading_books[index] = {
                    id: file_id,
                    progress: parseInt((received / total) * 100),
                }
                this.setState({
                    downloading_books: downloading_books
                })
            })
            .then((res) => {
                // the temp file path
                console.log('The file saved to ', res.path())
                let new_downloaded_books = this.state.downloaded_books
                new_downloaded_books.push({
                    id: file_id,
                    file_path:  res.path(),
                });
                downloading_books.splice(index, 1);
                this.setState({
                    downloaded_books: new_downloaded_books,
                    downloading_books: downloading_books,
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
        });
        // AsyncStorage.clear();
    }
    playAudio(id){
        console.log('play audio fired', id);
        let playingAudio = {};
        this.state.downloaded_books.forEach(el => {
            if (el.id == id){
                playingAudio.path = el.file_path;
            }
        })
        this.state.books.forEach(el => {
            if (el.id == id){
                playingAudio.name = el.name;
                playingAudio.description = el.description;
            }
        })
        this.setState({
            isOpenModal: true,
            playing: true,
            playingAudio: playingAudio,
        })
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
                        let fl = false;
                        let progress;
                        this.state.downloading_books.forEach(e => {
                            if (e.id == item.id){
                                fl = true;
                                progress = e.progress;
                            }
                        });
                        if (fl){
                            audioAction = <TouchableOpacity><Text>Загрузка {progress}%</Text></TouchableOpacity>
                        } else {
                            this.state.downloaded_books.forEach(el => {
                                if (el.id == item.id){
                                    flag = true;
                                }
                            })
                            if (flag){
                                audioAction = (
                                    <TouchableOpacity onPress={() => this.playAudio(item.id)}>
                                        <View style={{flex: 1, justifyContent: "center", flexDirection: 'column', alignItems: 'center'}}>
                                            <View>
                                                <Ionicons name="ios-play" size={23} color="tomato" style={{margin: 'auto'}} />
                                            </View>
                                            <Text>Слушать</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            } else {
                                audioAction = (
                                    <TouchableOpacity onPress={() => this.downloadBook(item.id)}>
                                        <View style={{flex: 1, justifyContent: "center", flexDirection: 'column', alignItems: 'center'}}>
                                            <View>
                                                <Ionicons name="ios-cloud-download" size={23} color="tomato" style={{margin: 'auto'}} />
                                            </View>
                                            <Text>Скачать</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }
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
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={this.state.isOpenModal}
                    onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                    }}
                >
                    <TouchableWithoutFeedback
                        onPress={() => this.setState({isOpenModal: false})}
                    >
                        <View style={{
                                flex: 1,
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.8)'
                            }}>
                        </View>
                    </TouchableWithoutFeedback>
                    <View style={{
                        height: 350,
                        backgroundColor: '#fafafa',
                        flex: 0,
                        width: '100%',
                        padding: 10
                    }}>
                        <Text style={{textAlign: 'center'}}>{this.state.playingAudio.name}</Text>
                        <Text style={{textAlign: 'center'}}>{this.state.playingAudio.description}</Text>
                        <View>
                            <Slider
                                style={{
                                    marginTop: 20,
                                    marginBottom: 20,
                                }}
                            />
                        </View>
                        <View style={{flex: 0, flexDirection: 'row', justifyContent: 'center', alignItems:'center'}}>
                            <TouchableOpacity>
                                <View style={{flex: 0, alignItems: 'center'}}>
                                    <View style={{transform: [{rotateY: '180deg'}]}}>
                                        <Ionicons name="ios-refresh" size={30} color="tomato" />
                                    </View>
                                    <Text style={{fontSize: 10}}>-15 сек.</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setState({playing: !this.state.playing})}>
                                <View style={{marginRight: 20, marginLeft: 20}}>
                                    {this.state.playing ? <Ionicons name="ios-pause" size={35} color="tomato" /> : <Ionicons name="ios-play" size={35} color="tomato" />}
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <View style={{flex: 0, alignItems: 'center'}}>
                                    <Ionicons name="ios-refresh" size={30} color="tomato" />
                                    <Text style={{fontSize: 10}}>+15 сек.</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
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