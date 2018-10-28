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
  Slider,
  ActivityIndicator,
} from 'react-native';
import { API_URL } from '../constants/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNFetchBlob from 'rn-fetch-blob'
// import { ServerRequest } from 'http';
import { listStyles } from '../constants/list_styles';
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
        downloading: false,
        playingAudio: {},
        playing: false,
        whoosh: {},
        duration: 0,
        currentTime: 0,
        prerender: false,
      }
    }
    static navigationOptions = ({navigation}) => {
        const bookName = navigation.getParam('book_name');
        const downloadAll = navigation.getParam('downloadAll');
        const downloading = navigation.getParam('downloading');
        const cancelTask = navigation.getParam('cancelTask');
        console.log('downloading123', downloading);
        if (downloading){
            return {
                headerTitle: bookName,
                headerRight: (
                    null
                    // <TouchableOpacity onPress={() => cancelTask()}>
                    //     <View style={{alignItems: 'center', flex: 1, flexDirection: 'column', marginRight: 10}}>
                    //             <Ionicons name={"ios-close-circle-outline"} size={25} color="tomato" style={{marginTop: 5}}/>
                    //             <Text style={{fontSize: 10, marginTop: -7}}>Остановить загрузку</Text>
                    //     </View>
                    // </TouchableOpacity>
                ),
                headerLeft: null
            }
        } else {
            return {
                headerTitle: bookName,
                headerRight: (
                    <TouchableOpacity onPress={() => downloadAll()}>
                        <View style={{alignItems: 'center', flex: 1, flexDirection: 'column', marginRight: 10}}>
                                <Ionicons name={"ios-cloud-download"} size={25} color="tomato" style={{marginTop: 5}}/>
                                <Text style={{fontSize: 10, marginTop: -7}}>Скачать все</Text>
                        </View>
                    </TouchableOpacity>
                ),
            }
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
                AsyncStorage.getItem('downloaded_audio', (err,value) => {
                    console.log('from async storage', value);
                    if (value){
                        this.setState({
                            downloaded_books: JSON.parse(value)
                        })
                    }
                });
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
    downloadBook(file_id, need_play = false){
        console.log('start downloading', file_id)
        let { downloading_books } = this.state;
        downloading_books.push({
            id: file_id,
        });
        let index = downloading_books.length - 1;
        this.setState({
            downloading: true
        });
        this.props.navigation.setParams({downloading: true})
        AsyncStorage.setItem('downloading_audio', JSON.stringify(this.state.downloading_books));
        this.task = RNFetchBlob
            .config({
                // add this option that makes response data to be stored as a file,
                // this is much more performant.
                // path : dirs.DocumentDir + '/audios/' + file_id + '_' + Date.now() + '.mp3',
                fileCache : true,
                appendExt : 'mp3',
            })
            .fetch('GET', API_URL + `/get-audio-file?id=${file_id}`, {
                //some headers ..
            });
            this.task
            // listen to download progress event
            .progress((received, total) => {
                let { downloading_books } = this.state;
                let index = downloading_books.length - 1;
                console.log('downloading_books', downloading_books)
                console.log('progress', received / total)
                downloading_books[index] = {
                    id: file_id,
                    progress: parseInt((received / total) * 100),
                }
                AsyncStorage.setItem('downloading_audio', JSON.stringify(this.state.downloading_books));
                try {
                    this.setState({
                        downloading_books: downloading_books
                    })
                } catch(e) {
                    console.log('crash');
                }
            });
            this.task
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
                    downloading: false,
                });
                this.props.navigation.setParams({downloading: this.state.downloading})
                AsyncStorage.setItem('downloaded_audio', JSON.stringify(this.state.downloaded_books));
                AsyncStorage.setItem('downloading_audio', JSON.stringify(this.state.downloading_books));
                    //play after download automatically
                    if (need_play){
                        this.playAudio(file_id);
                    }
            })
            console.log('this task', this.task)
    }
    deleteBook(id){
        // let path = null;
        // let index = null;
        let arr = this.state.downloaded_books;
        console.log('arr', arr)
        console.log('arg id', id)
        this.state.downloaded_books.forEach((el, index) => {
            console.log(el)
            if (el.id == id){
                console.log('id is here', id)
                console.log('path is here', el.file_path)
                arr.splice(index, 1);
                RNFetchBlob.fs.unlink(el.file_path)
                .then(() => {
                    this.setState({
                        downloaded_books: arr
                    })
                    AsyncStorage.setItem('downloaded_audio', JSON.stringify(this.state.downloaded_books));
                })
                .catch((err) => {
                    console.log('error while delete file', err)
                })
            }
        });
        console.log('delete new arr',arr);
    }
    downloadAll = () => {
        this.need_to_download = [];
        this.state.books.forEach(book => {
            let downloaded = false;
            this.state.downloaded_books.forEach(d_book => {
                if (book.id == d_book.id) {
                    downloaded = true;
                }
            })
            if (!downloaded){
                this.need_to_download.push(book.id);
                // this.downloadBook(book.id, false);
            }
        })
        if (this.need_to_download.length){
            this.downloadBookQueue();
        }
        console.log('need_to_download', this.need_to_download);
        console.log('download all')
    }
    downloadBookQueue(){
        console.log('downloadBookQueue', this.need_to_download)
        if (this.need_to_download.length){
            console.log('start downloading', file_id)
            let { downloading_books } = this.state;
            let file_id = this.need_to_download[0];
            downloading_books.push({
                id: file_id,
            });
            let index = downloading_books.length - 1;
            this.setState({
                downloading: true
            });
            this.props.navigation.setParams({downloading: true})
            AsyncStorage.setItem('downloading_audio', JSON.stringify(this.state.downloading_books));
            this.task = RNFetchBlob
                .config({
                    fileCache : true,
                    appendExt : 'mp3',
                })
                .fetch('GET', API_URL + `/get-audio-file?id=${file_id}`, {
                });
                this.task
                .progress((received, total) => {
                    let { downloading_books } = this.state;
                    let index = downloading_books.length - 1;
                    console.log('downloading_books', downloading_books)
                    console.log('progress', received / total)
                    downloading_books[index] = {
                        id: file_id,
                        progress: parseInt((received / total) * 100),
                    }
                    AsyncStorage.setItem('downloading_audio', JSON.stringify(this.state.downloading_books));
                    try {
                        this.setState({
                            downloading_books: downloading_books
                        })
                    } catch(e) {
                        console.log('crash');
                    }
                });
                this.task
                .then((res) => {
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
                        downloading: false,
                    });
                    this.props.navigation.setParams({downloading: this.state.downloading})
                    AsyncStorage.setItem('downloaded_audio', JSON.stringify(this.state.downloaded_books));
                    AsyncStorage.setItem('downloading_audio', JSON.stringify(this.state.downloading_books));
                    this.need_to_download.shift();
                    this.downloadBookQueue();
                })
                console.log('this task', this.task)
        } else {
            return;
        }
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
        // AsyncStorage.getItem('downloading_audio', (err,value) => {
        //     console.log('from async storage downloading', value);
        //     if (value){
        //         this.setState({
        //             downloading_books: JSON.parse(value)
        //         })
        //     }
        // });
        // AsyncStorage.clear();
        this.props.navigation.setParams({downloadAll: this.downloadAll})
        this.props.navigation.setParams({downloading: this.state.downloading})
        this.props.navigation.setParams({cancelTask: this.cancelTask})
    }
    playFromReader(){
        //проверим пришел ли в пропсы айди аудиофайла, если да, то проиграем его (или скачаем и проиграем)
        this.audiofile_id = this.props.navigation.getParam('audiofile_id');
        setTimeout(() => {
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
                    //если не скачана, то проиграть онлайн, для этого нужно определиться с урлом
                    let path;
                    this.state.books.forEach(el => {
                        if (el.id == this.audiofile_id){
                            path = el.file_src
                        }
                    });
                    this.playAudio(this.audiofile_id, path);
                    // this.downloadBook(this.audiofile_id);
                }
                console.log('play audio here', this.audiofile_id)
            }
        }, 300);
    }
    willFocusSubscription = this.props.navigation.addListener(
        'willFocus',
        payload => {
          this.playFromReader();
        }
    );
    cancelTask(){
        console.log('cancelTask()');
        if (this.task){
            this.task.cancel((err, taskId) => {
                console.log('task cancelled', err, taskId);
                this.setState({
                    downloading: false,
                    downloading_books: [],
                })
                this.props.navigation.setParams({downloading: false})
            });
        } else {
            console.log('task is not defined')
        }
    }
    componentWillUnmount(){
        console.log('comp will unmount');
        clearInterval(this.timerID);
        this.cancelTask();
    }
    playAudio(id, path = null){
        console.log('play audio fired', id, path);
        let playingAudio = {};
        if (path){
            //проиграть онлайн
            playingAudio.path = `https://mobile-app.flamesclient.ru/${path}`;
        } else {
            //брать с оффлайна
            this.state.downloaded_books.forEach(el => {
                if (el.id == id){
                    playingAudio.path = el.file_path;
                }
            })
        }
        console.log(playingAudio)
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
                } else {
                    if (this.state.playing){
                        console.log('Playing sound');
                        this.whoosh.play(() => {
                            this.whoosh.release();
                        });
                        // loaded successfully
                        console.log('duration in seconds: ' + this.whoosh.getDuration() + 'number of channels: ' + this.whoosh.getNumberOfChannels());
                        this.setState({
                            prerender: false
                        })
                        this.setState({
                            whoosh: this.whoosh,
                            duration: parseInt(this.whoosh.getDuration())
                        })
                        this.timerID = setInterval(
                            () => this.tick(),
                            1000
                        );
                    } else {
                        console.log('it not to should playing');
                        this.whoosh.release();
                    }
                }
            });
            // whoosh.setVolume(0.5);
            console.log('volume: ' + this.whoosh.getVolume());
            console.log('pan: ' + this.whoosh.getPan());
            console.log('loops: ' + this.whoosh.getNumberOfLoops());
        }, 300);
        // Play the sound with an onEnd callback
        //if offline
        if (!path){
            console.log("its offline")
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
        else {
        //     //if online
            console.log("its online", playingAudio.path)
            this.setState({
                prerender: true
            })
        //     this.whoosh = new Sound(
        //     // const sound = new Sound(
        //         playingAudio.path,
        //         undefined,
        //         (error) => {
        //             console.log('starting...')
        //             if (error) {
        //                 console.log(error);
        //             } else {
        //                 console.log('Playing sound');
        //                 this.whoosh.play(() => {
        //                     this.whoosh.release();
        //                 });
        //             }
        //         }
        //     );
        }
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
        this.whoosh.reset();
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
                    style={{paddingLeft: 10, paddingRight: 10, paddingBottom: 5, paddingTop: 5}}
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
                            audioAction = (
                                <View style={{flex: 0, flexDirection: 'row', alignItems: 'center'}}>
                                    <TouchableOpacity style={{minWidth: 100}}><Text>Загрузка {progress}%</Text></TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.cancelTask()}>
                                        <View style={{alignItems: 'center', flex: 1, flexDirection: 'column', marginRight: 10, marginLeft: 10}}>
                                                <Ionicons name={"ios-close-circle-outline"} size={25} color="tomato" style={{marginTop: 5}}/>
                                                <Text style={{fontSize: 10, marginTop: -7}}>Остановить загрузку</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )
                        } else {
                            this.state.downloaded_books.forEach(el => {
                                if (el.id == item.id){
                                    flag = true;
                                }
                            })
                            if (flag){
                                audioAction = (
                                    <View style={{flex: 0, flexDirection: 'row', alignItems: 'center'}}>
                                        <TouchableOpacity onPress={() => this.deleteBook(item.id)}>
                                            <View style={{flex: 1, justifyContent: "center", flexDirection: 'column', alignItems: 'center'}}>
                                                <View>
                                                    <Ionicons name="ios-trash" size={23} color="tomato" style={{margin: 'auto'}} />
                                                </View>
                                                <Text>Удалить</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => this.playAudio(item.id)}>
                                            <View style={{flex: 1, justifyContent: "center", flexDirection: 'column', alignItems: 'center', marginLeft: 10}}>
                                                <View>
                                                    <Ionicons name="ios-play" size={23} color="tomato" style={{margin: 'auto'}} />
                                                </View>
                                                <Text>Слушать</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                )
                            } else {
                                audioAction = (
                                    <View style={{flex: 0, flexDirection: 'row', alignItems: 'center'}}>
                                        {!this.state.downloading ? (
                                            <TouchableOpacity onPress={() => this.downloadBook(item.id)}>
                                                <View style={{flex: 1, justifyContent: "center", flexDirection: 'column', alignItems: 'center'}}>
                                                    <View>
                                                        <Ionicons name="ios-cloud-download" size={23} color="tomato" style={{margin: 'auto'}} />
                                                    </View>
                                                    <Text>Скачать</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity onPress={() => Alert.alert('Дождитесь окончания загрузки')}>
                                                <View style={{flex: 1, justifyContent: "center", flexDirection: 'column', alignItems: 'center'}}>
                                                    <View>
                                                        <Ionicons name="ios-cloud-download" size={23} color="#c1ae97" style={{margin: 'auto'}} />
                                                    </View>
                                                    <Text>Скачать</Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity onPress={() => this.playAudio(item.id, item.file_src)}>
                                            <View style={{flex: 1, justifyContent: "center", flexDirection: 'column', alignItems: 'center', marginLeft: 10}}>
                                                <View>
                                                    <Ionicons name="ios-play" size={23} color="tomato" style={{margin: 'auto'}} />
                                                </View>
                                                <Text>Слушать онлайн</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                )
                            }
                        }
                        return (
                            <View style={listStyles.quoteItem}>
                                <View style={{flex: 1}}>
                                    <Text style={[listStyles.quoteTitle, {textAlign: 'center'}]}>{item.name}</Text>
                                    {item.description && <Text style={{marginTop: 10, textAlign: 'center'}}>{item.description}</Text>}
                                </View>
                                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 5}}>
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
                            {this.state.prerender ? (
                                <View style={{flex: 1, flexDirection: 'column', marginTop: -15, marginBottom: 5, justifyContent: 'center', alignItems: 'center'}}>
                                    <ActivityIndicator size="large" color="tomato" />
                                    <Text>Загрузка...</Text>
                                </View>
                            ) : (
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
                            )}
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
    },
    audio_row: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 10,
        paddingTop: 25,
        paddingBottom: 25,
        borderBottomWidth: 1,
        borderBottomColor: '#eaeaea'
    },
  })