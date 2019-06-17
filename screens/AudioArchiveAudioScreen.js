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
  Alert,
  TouchableWithoutFeedback,
  Slider,
  ActivityIndicator,
  Easing,
  Dimensions
} from 'react-native';
import { SafeAreaView } from "react-navigation";
import { API_URL } from '../constants/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNFetchBlob from 'rn-fetch-blob'
import RNBackgroundDownloader from 'react-native-background-downloader';
import TextTicker from "react-native-text-ticker";
// import { ServerRequest } from 'http';
import { listStyles } from '../constants/list_styles';
import Pagination, { Icon, Dot } from "react-native-pagination"; //{Icon,Dot} also available
import { connect } from 'react-redux'
import {
    setNeedToDownload,
    setDownloadingBook,
    setDownloadTask,
    setDownloadedBooks,
    setGlobalDownloading,
    setNowPlaying
} from '../actions/index'
// let dirs = RNFetchBlob.fs.dirs
var Sound = require('react-native-sound');
import MusicControl from 'react-native-music-control';
Sound.setCategory('Playback');
MusicControl.handleAudioInterruptions(true);

class AudioArchiveAudioScreen extends Component {
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
        const lang = navigation.getParam('lang');
        const cancelTask = navigation.getParam('cancelTask');
        const online = navigation.getParam('online');
        const dim = Dimensions.get('window');
        console.log('downloading123', downloading);
        console.log('lang header', lang);
        console.log('bookName', bookName);
                return {
                    headerBackTitle: "Back",
                    headerStyle: (dim.height == 812 || dim.width == 812 || dim.height == 896 || dim.width == 896) ? {
                        height: 65
                      } : {},
                }
    }
    whoosh = {};
    _keyExtractor = (item) => item.id
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
                    let ASdownloaded_audio_;
                    if (this.props.main.lang == 'eng' || this.props.main.lang == 'en'){
                        ASdownloaded_audio_ = 'downloaded_audio__eng';
                    } else if (this.props.main.lang == 'es') {
                        ASdownloaded_audio_ = 'downloaded_audio_es';
                    } else {
                        ASdownloaded_audio_ = 'downloaded_archive_audio_';
                    }
                    AsyncStorage.setItem(ASdownloaded_audio_+this.state.book_id, JSON.stringify(this.state.downloaded_books));
                })
                .catch((err) => {
                    console.log('error while delete file', err)
                })
            }
        });
        console.log('delete new arr',arr);
    }
    downloadBookQueue(){
        let need_to_download = this.props.main.audio.need_to_download;
        console.log('downloadBookQueue', need_to_download)
        if (need_to_download.length){
            let { downloading_books } = this.state;
            let file_id = need_to_download[0];
            console.log('start downloading', file_id)
            let ASglobal_downloading;
            if (this.props.main.lang == 'eng' || this.props.main.lang == 'en'){
                ASglobal_downloading = 'global_downloading_eng';
            } else if (this.props.main.lang == 'es') {
                ASglobal_downloading = 'global_downloading_es';
            } else {
                ASglobal_downloading = 'global_downloading';
            }
            AsyncStorage.setItem(ASglobal_downloading, JSON.stringify({
                book_name: this.props.navigation.getParam('book_name'),
                book_id: this.props.navigation.getParam("book_id")
            }));
            this.props.setDownloadingBook({
                id: file_id,
                progress: 0
            });
            this.props.navigation.setParams({downloading: true})
            let path = RNBackgroundDownloader.directories.documents+`/audio_${file_id}.mp3`;
            let file_url;
            this.state.books.forEach(book => {
                if (book.id == file_id) {
                    file_url = book.file_path
                }
            });
            this.task = RNBackgroundDownloader.download({
                id: 'file123',
                url: file_url,
                destination: path,
            }).begin((expectedBytes) => {
                console.log(`Going to download ${expectedBytes} bytes!`);
            }).progress((percent) => {
                console.log(`Downloaded: ${percent * 100}%`);
                this.props.setDownloadingBook({
                    id: file_id,
                    progress: parseInt(percent * 100),
                })
            }).done((arg) => {
                console.log('Download is done!', path);
                let new_downloaded_books = this.state.downloaded_books
                new_downloaded_books.push({
                    id: file_id,
                    file_path: path,
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
                let ASneed_to_delete_queue;
                if (this.props.main.lang == 'eng' || this.props.main.lang == 'en'){
                    ASneed_to_delete_queue = 'need_to_delete_queue_eng';
                } else if (this.props.main.lang == 'es') {
                    ASneed_to_delete_queue = 'need_to_delete_queue_es';
                } else {
                    ASneed_to_delete_queue = 'need_to_delete_queue_archive';
                }
                AsyncStorage.getItem(ASneed_to_delete_queue, (err, value) => {
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
                        AsyncStorage.removeItem(ASneed_to_delete_queue)
                        return;
                    } else {
                        console.log('set item to downloaded_archive_audio_'+this.state.book_id, this.state.downloaded_books)
                        let ASdownloaded_audio_;
                        let AScancel_task;
                        if (this.props.main.lang == 'eng' || this.props.main.lang == 'en'){
                            ASdownloaded_audio_ = 'downloaded_audio__eng';
                            AScancel_task = 'cancel_task_eng';
                        } else if (this.props.main.lang == 'es') {
                            ASdownloaded_audio_ = 'downloaded_audio_es';
                            AScancel_task = 'cancel_task_es';
                        } else {
                            ASdownloaded_audio_ = 'downloaded_archive_audio_';
                            AScancel_task = 'cancel_task';
                        }
                        AsyncStorage.setItem(ASdownloaded_audio_+this.state.book_id, JSON.stringify(this.state.downloaded_books));
                        AsyncStorage.getItem(AScancel_task, (err, value) => {
                            if (value){
                                this.need_to_download = [];
                                AsyncStorage.removeItem(AScancel_task);
                                console.log('removing global_downloading 1-0');
                                return
                            } else {
                                //return it!!!
                                this.downloadBookQueue();
                            }
                        });
                    }
                })
            }).error((error) => {
                console.log('Download canceled due to error: ', error);
            });
            this.props.setDownloadTask(this.task);
        } else {
            let ASglobal_downloading;
            if (this.props.main.lang == 'eng' || this.props.main.lang == 'en'){
                ASglobal_downloading = 'global_downloading_eng';
            } else if (this.props.main.lang == 'es') {
                ASglobal_downloading = 'global_downloading_es';
            } else {
                ASglobal_downloading = 'global_downloading';
            }
            console.log('removing global_downloading 1');
            AsyncStorage.removeItem(ASglobal_downloading);
            return;
        }
    }
    componentDidMount(){
        this.setState({
            books: this.props.navigation.getParam('audio'),
            book_id: this.props.navigation.getParam('author_id'),
            online: this.props.navigation.getParam('online'),
        })
        console.log('did mount')
        setTimeout(() => {
            this.getDownloadedDataFromAyncStorage();
        }, 1000);
        // AsyncStorage.clear();
        // this.downloadBook(2)
        this.props.navigation.setParams({downloadAll: this.downloadAll})
        this.props.navigation.setParams({downloading: this.state.downloading})
        this.props.navigation.setParams({cancelTask: this.cancelTask})
        this.props.navigation.setParams({online: this.state.online})
        this.props.navigation.setParams({online: this.state.online})
        MusicControl.on('pause', ()=> {
            // this.props.dispatch(pauseRemoteControl());
            this.togglePlaying();
            MusicControl.enableControl('play', true)
            MusicControl.enableControl('pause', false)
        });
        MusicControl.on('play', ()=> {
            // this.props.dispatch(pauseRemoteControl());
            this.togglePlaying();
            MusicControl.enableControl('play', false)
            MusicControl.enableControl('pause', true)
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
    willBlurSubscription = this.props.navigation.addListener(
        'willBlur',
        () => {
          console.log('will Blur fired')
          clearInterval(this.downloaderChecker);
        }
    );
    getDownloadedDataFromAyncStorage(){
        console.log('getDownloadedDataFromAyncStorage');
        let ASdownloaded_audio_;
        ASdownloaded_audio_ = 'downloaded_archive_audio_';
        console.log('getDownloadedDataFromAyncStorage', ASdownloaded_audio_+this.state.book_id)
        AsyncStorage.getItem(ASdownloaded_audio_+this.state.book_id, (err,value) => {
            if (value){
                console.log('from async storage downloaded_audio_'+this.state.book_id, value);
                console.log('-----');
                console.log('check existing files');
                try {
                    let val_arr = JSON.parse(value);
                    val_arr.forEach(File => {
                        console.log('check path -- ', File.file_path);
                        RNFetchBlob.fs.exists(File.file_path)
                        .then((exist) => {
                            console.log(`file ${exist ? '' : 'not'} exists`)
                            if (!exist){
                                this.deleteBook(File.id);
                            }
                        })
                        .catch(() => { console.log("RNFB error") });
                    });
                    console.log('-----');
                } catch (e){
                    console.log('crash on 476 line', e);
                }
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
        // this.props.main.audio.task.cancel((err, taskId) => {
        //     console.log('task cancelled', err, taskId);
        //     AsyncStorage.setItem('_archiveneed_to_delete_queue', String(audio_id));
        //     this.setState({
        // //         downloading: false,
        // //         downloading_books: [],
        // //         need_to_delete: true,
        //         need_to_delete_queue: true,
        //         need_to_delete_id: this.props.main.audio.downloading_book.id,
        //     })
        // //     this.props.navigation.setParams({downloading: false})
        // //     this.props.setDownloadingBook({});
        // //     this.props.setNeedToDownload([]);
        // })
        //
        this.props.main.audio.task.stop();
        //
        console.log('removing global_downloading 4');
        let ASglobal_downloading;
        let ASneed_to_download_;
        if (this.props.main.lang == 'eng' || this.props.main.lang == 'en'){
            ASglobal_downloading = 'global_downloading_eng';
            ASneed_to_download_ = 'need_to_download__eng';
        } else if (this.props.main.lang == 'es') {
            ASglobal_downloading = 'global_downloading_es';
            ASneed_to_download_ = 'need_to_download_es';
        } else {
            ASglobal_downloading = 'global_downloading';
            ASneed_to_download_ = 'need_to_download_';
        }
        AsyncStorage.removeItem(ASglobal_downloading);
        AsyncStorage.removeItem(ASneed_to_download_+this.state.book_id);

    }
    componentWillUnmount(){
        console.log('comp will unmount');
        clearInterval(this.timerID);
        clearInterval(this.downloaderChecker);
        // this.cancelTask();
    }
    playAudio(id, path = null, toc_id = null){
        console.log('play audio fired', id, path)
        if (this.whoosh){
            try {
                this.whoosh.stop();
                this.whoosh.release();
            } catch (e){
                console.log('crash', e)
            }
        }
        console.log('play audio fired', id, path);
        let playingAudio = {};
        if (path){
            //проиграть онлайн
            playingAudio.path = path;
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
                        playingAudio.path = el.file_path;
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
                            title: this.state.playingAudio.name,
                            duration: this.state.duration, // (Seconds)
                        });
                        MusicControl.enableControl('play', false)
                        MusicControl.enableControl('pause', true)
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
        // let { whoosh } = this.state;
        let {playing, track_id, track_name, track_duration, toc_id, whoosh} = this.props.now_playing;
        try {
            if (this.state.playing){
                this.setState({
                    playing: !this.state.playing
                });
                setNowPlaying(!playing, track_id, track_name, track_duration, toc_id, whoosh)
                whoosh.pause();
                MusicControl.enableControl('play', true)
                MusicControl.enableControl('pause', false)
            } else {
                this.setState({
                    playing: !this.state.playing
                });
                whoosh.play()
                setNowPlaying(!playing, track_id, track_name, track_duration, toc_id, whoosh)
                MusicControl.enableControl('play', false)
                MusicControl.enableControl('pause', true)
                MusicControl.enableControl('changePlaybackPosition', true)
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
        try {
            whoosh.pause();
        } catch (e) {
            console.log('crash')
        }
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
            let AScached_audio_list;
            if (this.props.main.lang == 'eng' || this.props.main.lang == 'en'){
                AScached_audio_list = 'cached_audio_list_eng';
            } else if (this.props.main.lang == 'es') {
                AScached_audio_list = 'cached_audio_list_es';
            } else {
                AScached_audio_list = 'cached_audio_list';
            }
            AsyncStorage.getItem(AScached_audio_list, (err, value) => {
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
    _renderItem = ({ item }) => {
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
                    <TouchableOpacity style={{minWidth: 100}}><Text>{this.props.main.lang == 'ru' ? 'Загрузка' : this.props.main.lang == 'es' ? 'Descargando' : 'Downloading'} {progress}%</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => this.cancelTask(item.id)}>
                        <View style={{alignItems: 'center', flex: 1, flexDirection: 'column', marginRight: 10, marginLeft: 10}}>
                            <Ionicons name={"ios-close-circle-outline"} size={25} color="tomato" style={{marginTop: 5}}/>
                            <Text style={{fontSize: 10, marginTop: -7}}>{this.props.main.lang == 'ru' ? 'Остановить загрузку' : this.props.main.lang == 'es' ? 'Cancelar descarga' : 'Cancel download'}</Text>
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
                                <Text>{this.props.main.lang == 'ru' ? 'Удалить' : this.props.main.lang == 'es' ? 'Borrar' : 'Delete'}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.playAudio(item.id, null, toc_id)}>
                            <View style={{flex: 1, justifyContent: "center", flexDirection: 'column', alignItems: 'center', marginLeft: 10}}>
                                <View>
                                    <Ionicons name="ios-play" size={23} color="tomato" style={{margin: 'auto'}} />
                                </View>
                                <Text>{this.props.main.lang == 'ru' ? 'Слушать' : this.props.main.lang == 'es' ? 'Escucha' : 'Listen'}</Text>
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
                                    <Text>{this.props.main.lang == 'ru' ? 'Скачать' : this.props.main.lang == 'es' ? 'Descargar' : 'Download'}</Text>
                                </View>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => Alert.alert('Дождитесь окончания загрузки')}>
                                <View style={{flex: 1, justifyContent: "center", flexDirection: 'column', alignItems: 'center'}}>
                                    <View>
                                        <Ionicons name="ios-cloud-download" size={23} color="#c1ae97" style={{margin: 'auto'}} />
                                    </View>
                                    <Text>{this.props.main.lang == 'ru' ? 'Скачать' : this.props.main.lang == 'es' ? 'Descargar' : 'Download'}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => this.state.online ? this.playAudio(item.id, item.file_path, toc_id) : Alert.alert('Необходимо подключение к интернету')}>
                            <View style={{flex: 1, justifyContent: "center", flexDirection: 'column', alignItems: 'center', marginLeft: 10}}>
                                <View>
                                    <Ionicons name="ios-play" size={23} color="tomato" style={{margin: 'auto'}} />
                                </View>
                                <Text>{this.props.main.lang == 'ru' ? 'Слушать онлайн' : this.props.main.lang == 'es' ? 'Escuchar en linea' : 'Listen online'}</Text>
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
                                <Text>{this.props.main.lang == 'ru' ? 'Читать' : this.props.main.lang == 'es' ? 'Leer' : 'To read'}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        )
    }
    render(){
        console.log('audio details render state', this.state);
        console.log('audio details render props', this.props);
        // console.log('main store string: ', JSON.stringify(this.props.main));
        return (
            <SafeAreaView   style={{flex: 1, backgroundColor: '#F5FCFF'}}>
                <FlatList
                    style={{paddingLeft: 10, paddingRight: 10, paddingBottom: 5, paddingTop: 5}}
                    data={this.state.books}
                    renderItem={this._renderItem}
                    keyExtractor={this._keyExtractor}
                    // onRefresh={() => this.getBooks()}
                    // refreshing={false}
                    ref={r => (this.refs = r)}
                    onViewableItemsChanged={this.onViewableItemsChanged} //need this
                >
                </FlatList>
                <Pagination
                    // dotThemeLight //<--use with backgroundColor:"grey"
                    listRef={this.refs} //to allow React Native Pagination to scroll to item when clicked  (so add "ref={r=>this.refs=r}" to your list)
                    paginationVisibleItems={this.state.viewableItems} //needs to track what the user sees
                    paginationItems={this.state.books} //pass the same list as data
                    paginationItemPadSize={3} //num of items to pad above and below your visable items
                    // pagingEnabled={true}
                    paginationStyle={{
                        width: 10,
                        alignItems: "center",
                        justifyContent: "space-between",
                        position: "absolute",
                        margin: 0,
                        bottom: 0,
                        right: 15,
                        padding: 0,
                        top: 0,
                        flex: 1
                    }}
                    dotIconSizeActive={10}
                />
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
                            height: 250,
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
                                            <Text style={{marginLeft: 10,}}>{this.props.main.lang == 'ru' ? 'Читать' : this.props.main.lang == 'es' ? 'Leer': 'To read'}</Text>
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
                                    }}>
                                        <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row'}}>
                                            <Text>{this.props.main.lang == 'ru' ? 'Остановить и закрыть' : this.props.main.lang == 'es' ? 'Cerrar' : 'Close'}</Text>
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
                                        <Text>{this.props.main.lang == 'ru' ? 'Загрузка...' : this.props.main.lang == 'es' ? 'Descargando' : 'Downloading...'}</Text>
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
                                        <Text style={{fontSize: 10}}>-15 {this.props.main.lang == 'ru' ? 'сек' : this.props.main.lang == 'es' ? 'seg' : 'sec'}.</Text>
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
                                        <Text style={{fontSize: 10}}>+15 {this.props.main.lang == 'ru' ? 'сек' : this.props.main.lang == 'es' ? 'seg' : 'sec'}.</Text>
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
  export default connect(mapStateToProps, mapDispatchToProps)(AudioArchiveAudioScreen)