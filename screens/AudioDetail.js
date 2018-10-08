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
// import { ServerRequest } from 'http';
let dirs = RNFetchBlob.fs.dirs
var Sound = require('react-native-sound');
Sound.setCategory('Playback');

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
        whoosh: {},
        duration: 0,
        currentTime: 0,
      }
    }
    static navigationOptions = ({navigation}) => {
        const bookName = navigation.getParam('book_name');
        const downloadAll = navigation.getParam('downloadAll');
        return {
            headerTitle: bookName,
            headerRight: (
                <TouchableOpacity onPress={() => downloadAll()}>
                <View style={{alignItems: 'center', flex: 1, flexDirection: 'column', marginRight: 10}}>
                        <Ionicons name={"ios-cloud-download"} size={25} color="tomato" style={{marginTop: 5}}/>
                        <Text style={{fontSize: 10, marginTop: -7}}>Скачать все</Text>
                </View>
                </TouchableOpacity>
            )
        }
    }
    whoosh = {};
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
    downloadBook(file_id, need_play = true){
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
                // path : dirs.DocumentDir + '/audios/' + file_id + '_' + Date.now() + '.mp3',
                fileCache : true,
                appendExt : 'mp3',
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
                    //play after download automatically
                    if (need_play){
                        this.playAudio(file_id);
                    }
            })
    }
    downloadAll = () => {
        this.state.books.forEach(book => {
            let downloaded = false;
            this.state.downloaded_books.forEach(d_book => {
                if (book.id == d_book.id) {
                    downloaded = true;
                }
            })
            if (!downloaded){
                this.downloadBook(book.id, false);
            }
        })
        console.log('download all')
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
        this.props.navigation.setParams({downloadAll: this.downloadAll})
    }
    playFromReader(){
        //проверим пришел ли в пропсы айди аудиофайла, если да, то проиграем его (или скачаем и проиграем)
        this.audiofile_id = this.props.navigation.getParam('audiofile_id');
        if (this.audiofile_id){
            let isDownloaded = false;
            this.state.downloaded_books.forEach(el => {
                if (el.id == this.audiofile_id){
                    isDownloaded = true;
                }
            });
            if (isDownloaded){
                this.playAudio(this.audiofile_id);
            } else {
                this.downloadBook(this.audiofile_id);
            }
            console.log('play audio here', this.audiofile_id)
        }
    }
    willFocusSubscription = this.props.navigation.addListener(
        'willFocus',
        payload => {
          this.playFromReader();
        }
    );
    componentWillUnmount(){
        clearInterval(this.timerID);
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
        });
        setTimeout(() => {
            console.log ('path', this.state.playingAudio.path);
            this.whoosh = new Sound(this.state.playingAudio.path, '', (error) => {
                if (error) {
                    console.log('failed to load the sound', error);
                    return;
                }
                // loaded successfully
                console.log('duration in seconds: ' + this.whoosh.getDuration() + 'number of channels: ' + this.whoosh.getNumberOfChannels());
                this.setState({
                    whoosh: this.whoosh,
                    duration: parseInt(this.whoosh.getDuration())
                })
                this.timerID = setInterval(
                    () => this.tick(),
                    1000
                );
            });
            // whoosh.setVolume(0.5);
            console.log('volume: ' + this.whoosh.getVolume());
            console.log('pan: ' + this.whoosh.getPan());
            console.log('loops: ' + this.whoosh.getNumberOfLoops());
        }, 300);
        // Play the sound with an onEnd callback
        setTimeout(() => {
            this.whoosh.play((success) => {
                console.log("starting play?")
                if (success) {
                console.log('successfully finished playing');
                this.setState({
                    playing: false,
                    isOpenModal: false
                })
                clearInterval(this.timerID);
                } else {
                console.log('playback failed due to audio decoding errors');
                // reset the player to its uninitialized state (android only)
                // this is the only option to recover after an error occured and use the player again
                this.whoosh.reset();
                }
            });
        }, 600);
    }
    togglePlaying(){
        // let { whoosh } = this.state;
        if (this.state.playing){
            this.setState({
                playing: !this.state.playing
            });
            this.whoosh.pause()
        } else {
            this.setState({
                playing: !this.state.playing
            });
            this.whoosh.play()
        }
    }
    stopPlaying(){
        this.setState({
            playing: !this.state.playing
        });
        this.whoosh.pause()
    }
    changePlyingPos(val){
        console.log('changePlyingPos', val)
        this.whoosh.setCurrentTime(parseInt(val));
    }
    plus15(){
        this.whoosh.getCurrentTime((seconds) => this.whoosh.setCurrentTime(seconds + 15));
    }
    minus15(){
        this.whoosh.getCurrentTime((seconds) => this.whoosh.setCurrentTime(seconds - 15));
    }
    tick(){
        this.whoosh.getCurrentTime((seconds) => this.setState({
            currentTime: parseInt(seconds)
        }))
    }
    toMMSS(secs){
        var sec_num = parseInt(secs, 10)    
        var minutes = Math.floor(sec_num / 60) % 60
        var seconds = sec_num % 60    
        return [minutes,seconds]
            .map(v => v < 10 ? "0" + v : v)
            // .filter((v,i) => v !== "00" || i > 0)
            .join(":")
    }
    redirectToReader(book_id, book_name, book_src, toc_href){
        this.props.navigation.navigate('Reader', {book_id: book_id, book_name: book_name, book_src: book_src, toc: toc_href});
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
                                <View style={{flex: 1, flexDirection: 'row', maxWidth: '40%', justifyContent: 'flex-end', alignItems: 'center'}}>
                                    {audioAction}
                                    {item.toc_id && (
                                        <TouchableOpacity onPress={() => this.redirectToReader(item.reader_book_id, item.reader_book_name, item.reader_book_src, item.toc_href)}>
                                            <View style={{flex: 0, justifyContent: "center", flexDirection: 'column', alignItems: 'center', marginLeft: 10}}>
                                                 <View>
                                                    <Ionicons name="ios-book" size={23} color="tomato" style={{margin: 'auto'}} />
                                                </View>
                                                <Text>Читать</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}
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
                        onPress={() => {this.setState({isOpenModal: false, currentTime: 0}); this.stopPlaying(); clearInterval(this.timerID);}}
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
                        height: 250,
                        backgroundColor: '#fafafa',
                        flex: 0,
                        width: '100%',
                        padding: 20
                    }}>
                        <Text style={{textAlign: 'center'}}>{this.state.playingAudio.name}</Text>
                        <Text style={{textAlign: 'center'}}>{this.state.playingAudio.description}</Text>
                        <View>
                            <Slider
                                style={{
                                    marginTop: 20,
                                    marginBottom: 5,
                                }}
                                minimumValue={0}
                                maximumValue={this.state.duration}
                                onValueChange={val => this.changePlyingPos(val)}
                                value={this.state.currentTime}
                            />
                            <View style={{flex: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                                <View>
                                    <Text>{this.toMMSS(this.state.currentTime)}</Text>
                                </View>
                                <View>
                                    <Text>{this.toMMSS(this.state.duration)}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{flex: 0, flexDirection: 'row', justifyContent: 'center', alignItems:'center'}}>
                            <TouchableOpacity onPress={() => this.minus15()}>
                                <View style={{flex: 0, alignItems: 'center'}}>
                                    <View style={{transform: [{rotateY: '180deg'}]}}>
                                        <Ionicons name="ios-refresh" size={30} color="tomato" />
                                    </View>
                                    <Text style={{fontSize: 10}}>-15 сек.</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.togglePlaying()}>
                                <View style={{marginRight: 20, marginLeft: 20}}>
                                    {this.state.playing ? <Ionicons name="ios-pause" size={35} color="tomato" /> : <Ionicons name="ios-play" size={35} color="tomato" />}
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.plus15()}>
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