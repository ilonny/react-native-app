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
import { connect } from 'react-redux'
import {
    setNeedToDownload,
    setDownloadingBook,
    setDownloadTask,
    setDownloadedBooks,
    setGlobalDownloading,
    setNowPlaying
} from '../actions/index'
let dirs = RNFetchBlob.fs.dirs
var Sound = require('react-native-sound');
Sound.setCategory('Playback');
import MusicControl from 'react-native-music-control';
MusicControl.handleAudioInterruptions(true);
class AudioScreen extends Component {
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
        playing: this.props.now_playing.playing,
        whoosh: {},
        duration: 0,
        currentTime: 0,
        prerender: false,
        online: this.props.navigation.getParam("online"),
      }
    }
    static navigationOptions = ({navigation}) => {
        const bookName = navigation.getParam('book_name');
        const downloadAll = navigation.getParam('downloadAll');
        const downloading = navigation.getParam('downloading');
        const cancelTask = navigation.getParam('cancelTask');
        const online = navigation.getParam('online');
        console.log('downloading123', downloading);
        if (online){
            return {
                headerTitle: bookName,
                headerRight: (
                    <TouchableOpacity onPress={() => downloadAll()}>
                        <View style={{alignItems: 'center', flex: 1, flexDirection: 'column', marginRight: 10}}>
                                <Ionicons name={"ios-cloud-download"} size={25} color="tomato" style={{marginTop: 12}}/>
                                <Text style={{fontSize: 10, marginTop: -7}}>Скачать все</Text>
                        </View>
                    </TouchableOpacity>
                ),
            }
        } else {
            return {
                headerTitle: bookName,
                headerRight: null,
            }
        }
    }
    whoosh = {};
    getBooks(need_to_play_from_reader = false){
        console.log('getBooks starts')
        console.log('getBooks url', API_URL + `/get-audio-files?book_id=${this.state.book_id}`)
        if (this.state.online){
            console.log('getBooks starts online')
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
                        console.log('parsedText', parsedText)
                        if (need_to_play_from_reader){
                            console.log('need_to_play_from_reader');
                            this.getDownloadedDataFromAyncStorage();
                            this.playFromReader();
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
        } else {
            console.log('getBooks starts offline')
            AsyncStorage.getItem('cached_audio_list', (err,value) => {
                // console.log('from async storage', value);
                if (value){
                    let books_arr = JSON.parse(value);
                    books_arr.forEach(el => {
                        if (el.id == this.state.book_id) {
                            this.setState({
                                books: el.audiofiles
                            })
                        }
                    });
                }
            });
        }
        AsyncStorage.getItem('downloaded_audio_'+this.state.book_id, (err,value) => {
            console.log('from async storage', value);
            if (value){
                this.setState({
                    downloaded_books: JSON.parse(value)
                })
            }
        });
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
        this.props.setNeedToDownload([].concat(file_id));
        setTimeout(() => {
            console.log('props is empty')
            this.downloadBookQueue();
        }, 300);
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
                    });
                    console.log('set downloaded books to props', arr)
                    this.props.setDownloadedBooks(arr);
                    AsyncStorage.setItem('downloaded_audio_'+this.state.book_id, JSON.stringify(this.state.downloaded_books));
                })
                .catch((err) => {
                    console.log('error while delete file', err)
                })
            }
        });
        console.log('delete new arr',arr);
    }
    downloadAll = () => {
        console.log('download_all fired')
        AsyncStorage.getItem('global_downloading', (err, value) => {
            console.log('get val global_downloading', value);
            if (value){
                let downloadObj = JSON.parse(value);
                Alert.alert('', 'Дождитесь окончания загрузки книги ' + downloadObj.book_name)
            } else {
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
                });
                this.props.setNeedToDownload(this.need_to_download);
                if (this.props.main.audio.need_to_download.length){
                    console.log('download all', this.need_to_download)
                    console.log('need_to_download', this.need_to_download);
                    console.log('download all starting')
                    this.downloadBookQueue();
                } else {
                    setTimeout(() => {
                        console.log('props is empty')
                        this.downloadBookQueue();
                    }, 300);
                }
            }
        });
    }
    downloadBookQueue(){
        let need_to_download = this.props.main.audio.need_to_download;
        console.log('downloadBookQueue', need_to_download)
        if (need_to_download.length){
            let { downloading_books } = this.state;
            let file_id = need_to_download[0];
            console.log('start downloading', file_id)
            AsyncStorage.setItem('global_downloading', JSON.stringify({
                book_name: this.props.navigation.getParam('book_name'),
                book_id: this.props.navigation.getParam("book_id")
            }));
            this.props.setDownloadingBook({
                id: file_id,
                progress: 0
            });
            this.props.navigation.setParams({downloading: true})
            this.task = RNFetchBlob
                .config({
                    fileCache : true,
                    appendExt : 'mp3',
                })
                .fetch('GET', API_URL + `/get-audio-file?id=${file_id}`, {
                });
                this.task
                .progress({interval: 1100}, (received, total) => {
                    console.log('progress', (received / total) * 100)
                    this.props.setDownloadingBook({
                        id: file_id,
                        progress: parseInt((received / total) * 100),
                    })
                });
                this.task
                .then((res) => {
                    console.log('The file saved to ', res.path())
                    let new_downloaded_books = this.state.downloaded_books
                    new_downloaded_books.push({
                        id: file_id,
                        file_path: res.path(),
                    });
                    this.props.setDownloadedBooks(new_downloaded_books);
                    this.setState({
                        downloaded_books: new_downloaded_books,
                        downloading: false,
                    });
                    this.props.setDownloadingBook({});
                    this.props.navigation.setParams({downloading: this.state.downloading})
                    need_to_download.shift();
                    //
                    AsyncStorage.getItem('need_to_delete_queue', (err, value) => {
                        console.log('need_to_delete_queue AS value', value)
                        if (value){
                            let need_to_delete_id = parseInt(value);
                            console.log('need to delete props', this.props);
                            console.log('need to delete id', need_to_delete_id);
                            this.deleteBook(need_to_delete_id);
                            this.setState({
                                need_to_delete_queue: false,
                                need_to_delete: false,
                                need_to_delete_id: null,
                            });
                            this.props.setDownloadingBook({});
                            this.props.setNeedToDownload([]);
                            AsyncStorage.removeItem('need_to_delete_queue')
                            return;
                        } else {
                            console.log('set item to downloaded_audio_'+this.state.book_id, this.state.downloaded_books)
                            AsyncStorage.setItem('downloaded_audio_'+this.state.book_id, JSON.stringify(this.state.downloaded_books));
                            AsyncStorage.getItem('cancel_task', (err, value) => {
                                if (value){
                                    this.need_to_download = [];
                                    AsyncStorage.removeItem('cancel_task');
                                    console.log('removing global_downloading 1-0');
                                    return
                                } else {
                                    //return it!!!
                                    this.downloadBookQueue();
                                }
                            });
                        }
                    })
                    //
                    // if (this.state.need_to_delete_queue){
                    // } else {
                    // }
                    // this.getBooks();
                })
                this.props.setDownloadTask(this.task);
                console.log('this task', this.task)
        } else {
            console.log('removing global_downloading 1');
            AsyncStorage.removeItem('global_downloading');
            return;
        }
    }
    componentDidMount(){
        // AsyncStorage.clear();
        // this.downloadBook(2)
        this.props.navigation.setParams({downloadAll: this.downloadAll})
        this.props.navigation.setParams({downloading: this.state.downloading})
        this.props.navigation.setParams({cancelTask: this.cancelTask})
        this.props.navigation.setParams({online: this.state.online})
        MusicControl.on('stop', ()=> {
            // this.props.dispatch(pauseRemoteControl());
            this.togglePlaying();
            console.log('MusicControl play fired')
            MusicControl.enableControl('play', true)
            MusicControl.enableControl('stop', true)
        });
        MusicControl.on('play', ()=> {
            // this.props.dispatch(pauseRemoteControl());
            this.togglePlaying();
            console.log('MusicControl play fired')
            MusicControl.enableControl('play', true)
            MusicControl.enableControl('stop', true)
            MusicControl.enableControl('changePlaybackPosition', true)
        });
        MusicControl.on('changePlaybackPosition', val=> {
            console.log('changePlaybackPosition', val)
            this.changePlyingPos(val)
            // this.props.dispatch(updateRemoteControl());
        })
        let {playing, track_id, track_name, track_duration, toc_id, whoosh} = this.props.now_playing;
        if (playing){
            console.log('cdm showing playing from props')
            this.setState({
                isOpenModal: true,
                playing: playing,
                playingAudio: {
                    id: track_id,
                    name: track_name,
                    toc_id: toc_id
                },
                whoosh: whoosh,
                duration: track_duration,
            });
            this.whoosh = whoosh;
            this.timerID = setInterval(
                () => this.tick(),
                1000
                );
        }
        // // import LotosImg from './lotos_2.png';
        // MusicControl.setNowPlaying({
        //     title: 'Billie Jean',
        //     // artist: 'Michael Jackson',
        //     // album: 'Thriller',
        //     // genre: 'Post-disco, Rhythm and Blues, Funk, Dance-pop',
        //     duration: 294, // (Seconds)
        //     description: '', // Android Only
        //     // color: 0xFFFFFF, // Notification Color - Android Only
        //     // date: '1983-01-02T00:00:00Z', // Release Date (RFC 3339) - Android Only
        //     // rating: 84, // Android Only (Boolean or Number depending on the type)
        //     // notificationIcon: 'my_custom_icon' // Android Only (String), Android Drawable resource name for a custom notification icon
        // })
        // // Basic Controls
        // setTimeout(() => {
        //     MusicControl.enableControl('play', true);
        //     MusicControl.enableControl('stop', true);
        //     console.log('?????111')
        // }, 1000);
        // MusicControl.enableControl('pause', true)
        // MusicControl.enableControl('stop', true)
        // MusicControl.enableControl('nextTrack', true)
        // MusicControl.enableControl('previousTrack', true)

        // // Changing track position on lockscreen
        // MusicControl.enableControl('changePlaybackPosition', true)


    }
    playFromReader(){
        console.log('playFromReader() 0');
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
                    console.log('playFromReader()');
                    this.playAudio(this.audiofile_id);
                } else {
                    //если не скачана, то проиграть онлайн, для этого нужно определиться с урлом
                    let path;
                    this.state.books.forEach(el => {
                        if (el.id == this.audiofile_id){
                            path = el.file_src
                        }
                    });
                    console.log('playFromReader() 2');
                    this.playAudio(this.audiofile_id, path);
                    // this.downloadBook(this.audiofile_id);
                }
                // console.log('play audio here', this.audiofile_id)
            }
        }, 400);
    }
    checkBookIdFromNavProps(){
        console.log('checkBookIdFromNavProps fired')
        this.book_id = this.props.navigation.getParam('book_id');
        if (this.state.book_id != this.book_id){
            this.setState({
                book_id: this.book_id
            });
            console.log('update books');
        }
        setTimeout(() => {
            this.getBooks(true);
        }, 100);
    }
    willFocusSubscription = this.props.navigation.addListener(
        'willFocus',
        () => {
            console.log('will focus fired')
            console.log('checkBookIdFromNavProps start')
            this.checkBookIdFromNavProps();
            this.getDownloadedDataFromAyncStorage();
            // console.log('playFromReader start')
            this.playFromReader();
        }
    );
    willBlurSubscription = this.props.navigation.addListener(
        'willBlur',
        () => {
          console.log('will Blur fired')
          clearInterval(this.downloaderChecker);
        }
    );
    getDownloadedDataFromAyncStorage(){
        console.log('getDownloadedDataFromAyncStorage');
        AsyncStorage.getItem('downloaded_audio_'+this.state.book_id, (err,value) => {
            console.log('from async storage downloaded_audio_'+this.state.book_id, value);
            if (value){
                this.setState({
                    downloaded_books: JSON.parse(value),
                })
            } else {
                console.log('err', err)
            }
        });
    }
    cancelTask(audio_id = null){
        console.log('cancelTask()');
        this.props.setDownloadingBook({});
        this.props.setNeedToDownload([]);
        this.need_to_download = [];
        this.props.main.audio.task.cancel((err, taskId) => {
            console.log('task cancelled', err, taskId);
            AsyncStorage.setItem('need_to_delete_queue', String(audio_id));
            this.setState({
        //         downloading: false,
        //         downloading_books: [],
        //         need_to_delete: true,
                need_to_delete_queue: true,
                need_to_delete_id: this.props.main.audio.downloading_book.id,
            })
        //     this.props.navigation.setParams({downloading: false})
        //     this.props.setDownloadingBook({});
        //     this.props.setNeedToDownload([]);
        })
        console.log('removing global_downloading 4');
        AsyncStorage.removeItem('global_downloading');
        AsyncStorage.removeItem('need_to_download_'+this.state.book_id);

    }
    componentWillUnmount(){
        console.log('comp will unmount');
        clearInterval(this.timerID);
        clearInterval(this.downloaderChecker);
        // this.cancelTask();
    }
    playAudio(id, path = null, toc_id = null){
        if (this.whoosh){
            try {
                this.whoosh.stop();
                this.whoosh.release();
            } catch (e){
                console.log('crash', e)
            }
        }
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
            //если нет в стейте, значит должно быть в пропсах
            if (!playingAudio.path) {
                console.log('должно быть в пропсах!', this.props)
                this.props.main.audio.downloaded_books.forEach(el => {
                    if (el.id == id){
                        playingAudio.path = el.file_path;
                    }
                })
            }
            //если нет и в пропсах, значит найдем путь в онлайне в стейте всех книг..
            if (!playingAudio.path) {
                console.log('нет в пропсах! ищем в стейте', this.state)
                this.state.books.forEach(el => {
                    if (el.id == id){
                        playingAudio.path = `https://mobile-app.flamesclient.ru/${el.file_src}`;
                    }
                })
            }
        }
        console.log(playingAudio)
        this.state.books.forEach(el => {
            if (el.id == id){
                playingAudio.name = el.name;
                playingAudio.description = el.description;
                playingAudio.id = el.id;
                playingAudio.toc_id = toc_id
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
                        console.log('Playing sound starts here');
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
                        MusicControl.setNowPlaying({
                            artwork: 'https://pp.userapi.com/c844723/v844723807/187b86/AVRiqWQD6dk.jpg',
                            title: this.state.playingAudio.name,
                            duration: this.state.duration, // (Seconds)
                        });
                        MusicControl.enableControl('play', true)
                        MusicControl.enableControl('stop', true)
                        MusicControl.enableControl('changePlaybackPosition', true)
                        console.log('music control enabled?')
                        console.log(this.whoosh)
                        this.props.setNowPlaying(
                            true,
                            this.state.playingAudio.id,
                            this.state.playingAudio.name,
                            this.state.duration,
                            this.state.playingAudio.toc_id,
                            this.whoosh
                        )
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
                        this.props.setNowPlaying(false, null, null, null, null);
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
        }
    }
    togglePlaying(){
        console.log('toggle fired')
        // let { whoosh } = this.state;
        let {playing, track_id, track_name, track_duration, toc_id, whoosh} = this.props.now_playing;
        try {
            if (this.state.playing){
                setNowPlaying(!playing, track_id, track_name, track_duration, toc_id, whoosh)
                whoosh.pause();
                MusicControl.enableControl('play', true)
                MusicControl.enableControl('stop', true)
                this.setState({
                    playing: !this.state.playing
                });
            } else {
                whoosh.play()
                setNowPlaying(!playing, track_id, track_name, track_duration, toc_id, whoosh)
                MusicControl.enableControl('play', true)
                MusicControl.enableControl('stop', true)
                MusicControl.enableControl('changePlaybackPosition', true)
                this.setState({
                    playing: !this.state.playing
                });
            }
        } catch (e){
            console.log('crash', e)
        }
    }
    stopPlaying(){
        // this.setState({
            //     playing: !this.state.playing
        // });
        // this.whoosh.pause()
        // this.whoosh.reset();
        let {playing, track_id, track_name, track_duration, toc_id, whoosh} = this.props.now_playing;
        setNowPlaying(!playing, track_id, track_name, track_duration, toc_id, whoosh)
        whoosh.pause();
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
        this.whoosh.getCurrentTime((seconds) => {
            this.setState({
                currentTime: parseInt(seconds)
            })
            MusicControl.updatePlayback({
                elapsedTime: parseInt(seconds)
            })
        })
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
    findAndRedirectReader(track_id){
        console.log('findAndRedirectReader', track_id);
        let track;
        track = this.state.books.find(el => {
            return el.id == track_id
        });
        if (!track){
            AsyncStorage.getItem('cached_audio_list', (err, value) => {
                console.log('cached_audio_list', value)
                let cached_books
                if (!!value){
                    try {
                        cached_books = JSON.parse(value)
                    } catch (e){
                        console.log('crash!', e)
                    }
                }
                cached_books.forEach(element => {
                    element.audiofiles.forEach(el => {
                        console.log('el', el)
                        if (el.id == track_id){
                            track = el;
                        }
                    })    
                });
                console.log('cached_books', cached_books);
                console.log('tract =', track);
                this.redirectToReader(track.reader_book_id, track.reader_book_name, track.reader_book_src, track.toc_href)
            });
        } else {
            console.log(track);
            this.redirectToReader(track.reader_book_id, track.reader_book_name, track.reader_book_src, track.toc_href)
        }
    }
    render(){
        console.log('audio details render state', this.state);
        console.log('audio details render props', this.props);
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#F5FCFF', paddingBottom: 10, paddingTop: 10}}>
                <FlatList
                    style={{paddingLeft: 10, paddingBottom: 5, marginLeft: 10,  paddingTop: 5}}
                    data={this.state.books}
                    renderItem={({item}) => {
                        let audioAction;
                        let flag = false;
                        let fl = false;
                        let progress;
                        let toc_id = item.toc_id ? item.toc_id : false
                        // this.state.downloading_books.forEach(e => {
                        if (this.props.main.audio.downloading_book.id == item.id){
                            fl = true;
                            progress = this.props.main.audio.downloading_book.progress;
                        }
                        if (fl){
                            audioAction = (
                                <View style={{flex: 0, flexDirection: 'row', alignItems: 'center'}}>
                                    <TouchableOpacity style={{minWidth: 100}}><Text>Загрузка {progress}%</Text></TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.cancelTask(item.id)}>
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
                            this.props.main.audio.downloaded_books.forEach(el => {
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
                                        <TouchableOpacity onPress={() => this.playAudio(item.id, null, toc_id)}>
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
                                        {(!this.state.downloading && !this.props.main.audio.need_to_download.length && !this.props.main.audio.downloading_book.id) ? (
                                            <TouchableOpacity onPress={() => this.state.online ? this.downloadBook(item.id) : Alert.alert('Необходимо подключение к интернету')}>
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
                                        <TouchableOpacity onPress={() => this.state.online ? this.playAudio(item.id, item.file_src, toc_id) : Alert.alert('Необходимо подключение к интернету')}>
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
                                    {!!item.description && <Text style={{marginTop: 10, textAlign: 'center'}}>{item.description}</Text>}
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
                {/* <Modal
                    animationType="fade"
                    transparent={true}
                    visible={this.state.isOpenModal}
                    onRequestClose={() => {
                        this.setState({
                                isOpenModal: false,
                                currentTime: 0
                            });
                        this.stopPlaying();
                        clearInterval(this.timerID);
                    }}
                > */}
                    {/* <TouchableWithoutFeedback
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
                    </TouchableWithoutFeedback> */}
                    {this.state.isOpenModal && (
                        <View style={{
                            height: 200,
                            backgroundColor: '#fafafa',
                            flex: 0,
                            width: '100%',
                            padding: 20,
                            paddingTop: 50,
                            position: 'absolute',
                            bottom: 0,
                        }}>
                            <View style={{position: 'absolute', left: 10, top: 8}}>
                                {this.state.playingAudio.toc_id ? (
                                    <TouchableOpacity onPress={() => this.findAndRedirectReader(this.state.playingAudio.id)}>
                                        <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row'}}>
                                            <Ionicons style={{marginTop: 2}} name="ios-list" size={25}/>
                                            <Text style={{marginLeft: 10,}}>Читать</Text>
                                        </View>
                                    </TouchableOpacity>
                                ) : (
                                <Text>{null}</Text>
                                )}
                            </View>
                            <View style={{position: 'absolute', flex: 1, right: 10, top: 5}}>
                                {/* <View style={{flex: 1, width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}> */}
                                    <TouchableOpacity onPress={() => {
                                        this.setState({isOpenModal: false, currentTime: 0});
                                        this.stopPlaying();
                                        clearInterval(this.timerID);
                                        this.props.setNowPlaying(false,null, null, null, null)
                                        MusicControl.resetNowPlaying()
                                    }}>
                                        <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row'}}>
                                            <Text>Остановить и закрыть</Text>
                                            <Ionicons style={{marginLeft: 10, marginTop: 2}} name="ios-close" size={30}/>
                                        </View>
                                    </TouchableOpacity>
                                {/* </View> */}
                            </View>
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
                                            marginTop: -10,
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
                    )}
                {/* </Modal> */}
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
  const mapStateToProps = (state) => {
	return {
        main: state.mainReducer,
        now_playing: state.mainReducer.now_playing,
	}
}
const mapDispatchToProps = (dispatch) => {
	return {
        setNeedToDownload: arr => dispatch(setNeedToDownload(arr)),
        setDownloadingBook: book => dispatch(setDownloadingBook(book)),
        setDownloadTask: task => dispatch(setDownloadTask(task)),
        setDownloadedBooks: downloaded_books => dispatch(setDownloadedBooks(downloaded_books)),
        setGlobalDownloading: global_downloading => dispatch(setGlobalDownloading(global_downloading)),
        setNowPlaying: (playing, track_id, track_name, track_duration, toc_id, whoosh) => dispatch(setNowPlaying(playing, track_id, track_name, track_duration, toc_id, whoosh))
	}
}
  export default connect(mapStateToProps, mapDispatchToProps)(AudioScreen)