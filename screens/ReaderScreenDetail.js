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
  FlatList
} from 'react-native';

import { Epub, Streamer } from "epubjs-rn";
import { API_URL } from '../constants/api';
import Ionicons from 'react-native-vector-icons/Ionicons';

class EpubReader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            flow: "paginated", // paginated || scrolled-continuous
            location: 0,
            // url: `https://mobile-app.flamesclient.ru/api/get-reader-book?id=${this.props.navigation.getParam("book_id")}`,
            url: `https://mobile-app.flamesclient.ru/${this.props.navigation.getParam("book_src")}`,
            src: "",
            origin: "",
            title: "",
            toc: [],
            showBars: true,
            showNav: false,
            sliderDisabled: true,
            successLoaded: false,
            reader_locations: [],
            book_id: this.props.navigation.getParam("book_id"),
            nav_opened: false,
            book_locations: [],
        };
        this.streamer = new Streamer();
        console.log('constructor props: ', this.props)
    }
    // static navigationOptions = ({navigation}) => {
    //     return {
    //         headerTitle: 'test',
    //         headerRight: (
    //             <View style={{alignItems: 'center', flex: 1, flexDirection: 'row'}}>
    //                 <TouchableOpacity onPress={() => toggleFav(navigation.state.params.quote_id)}>
    //                     <Ionicons name={navigation.state.params.isFavorite ? "ios-heart" : "ios-heart-outline"}  size={25} color="tomato" style={{marginTop: 5}}/>
    //                 </TouchableOpacity>
    //             </View>
    //         ),
    //     }
    // }

    static navigationOptions = ({navigation}) => {
        const toggleNavigation = navigation.getParam('toggleNavigation');
        const bookName = navigation.getParam('book_name')
        return {
            headerTitle: bookName,
            headerRight: (
                // <TouchableOpacity onPress={navigation.getParam('consoleState')}>
                <View style={{alignItems: 'center', flex: 1, flexDirection: 'row'}}>
                    <TouchableOpacity onPress={() => toggleNavigation()}>
                        <Ionicons name={"ios-list"} size={35} color="tomato" style={{marginTop: 5}}/>
                    </TouchableOpacity>
                </View>
            ),
            // title: 'test',
            headerStyle: {
                paddingRight: 10,
            },
        }
    }
    componentDidMount() {
        this.streamer.start()
        .then((origin) => {
            this.setState({origin})
            return this.streamer.get(this.state.url);
        })
        .then((src) => {
            return this.setState({src});
        });
        AsyncStorage.getItem('reader_locations', (err,value) => {
            if (value){
                console.log('async storage reader_locations value ', value);
                this.setState({
                    reader_locations: JSON.parse(value)
                })
                this.getInitialLocation()
            } else {
                console.log('async storage reader_locations value is empty', value);
            }
        })
        //get tocs from server
        let request = new XMLHttpRequest();
        request.onreadystatechange = (e) => {
            if (request.status === 200) {
                console.log('response: ', request.responseText)
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
                        book_locations: parsedText
                    }
                }
                })
            } else {
                console.log('failed reques', request)
            }
        };
        request.open('GET', API_URL + `/get-tocs?book_id=${this.state.book_id}`);
        request.send();

        this.props.navigation.setParams({toggleNavigation: this.toggleNavigation})
    }

    defineBookLocations(){
        console.log('defineBookLocations', book);
        // this.setState({
        //     book_locations: book.navigation.toc
        // })
    }
    checkInitialLocation(){
        this.toc_from_nav = this.props.navigation.getParam('toc');
        if (this.toc_from_nav && this.state.successLoaded){
            this.setState({
                location: this.toc_from_nav,
                nav_opened: false
            });
        }
    }
    willFocusSubscription = this.props.navigation.addListener(
        'willFocus',
        payload => {
          this.checkInitialLocation();
        }
    );
    componentWillUnmount() {
        console.log('epub reader unmount')
        this.streamer.kill();
    }

    toggleBars() {
        this.setState({ showBars: !this.state.showBars });
    }

    saveBookLocation(location, book_id){
        console.log('saveBookLocation', location, book_id)
        let { reader_locations } = this.state
        console.log('reader_locations', reader_locations)
        let changed = false;
        reader_locations.forEach(el => {
            if (el.id == book_id) {
                changed = true;
                el.location = location
                this.setState({
                    reader_locations: [].concat(reader_locations)
                })    
            }
        });
        if (!changed){
            console.log('not changed')
            let new_location = {
                id: book_id,
                location: location
            }
            console.log('new location', new_location)
            this.setState({
                reader_locations: this.state.reader_locations.concat(new_location)
            })
        }
        console.log('saveBookLocation end', JSON.stringify(reader_locations))
        AsyncStorage.setItem('reader_locations', JSON.stringify(reader_locations))   
    }

    getInitialLocation(){
        let { book_id, reader_locations } = this.state
        if (reader_locations instanceof Array) {
            reader_locations.forEach(element => {
                if (element.id == book_id){
                    this.setState({
                        location: element.location
                    })
                    // this.forceUpdate();
                }
            });
        }
    }

    toggleNavigation = () => {
        this.setState({
            nav_opened: !this.state.nav_opened
        })
    }

    redirectToAudio(audio_book_id, audiofile_id, audio_book_name){
        console.log('redirectToAudio', audio_book_id, audiofile_id);
        this.props.navigation.navigate('Audio', {book_id: audio_book_id, audiofile_id: audiofile_id, book_name: audio_book_name/*, book_src: item.file_src,*/});
    }
    render() {
        console.log("render state", this.state)
        return (
            <View style={styles.container}>
                <Epub style={styles.reader}
                    ref="epub"
                    src={this.state.src}
                    flow={this.state.flow}
                    location={this.state.location}
                    gap={10}
                    onLocationChange={(visibleLocation)=> {
                        console.log("locationChanged", visibleLocation)
                        try {
                            // if (visibleLocation.start){
                                // if (visibleLocation.start.location != this.state.visibleLocation.start.location){
                            this.saveBookLocation(visibleLocation.start.cfi, this.state.book_id);
                                // }
                            // }
                            this.setState({visibleLocation});
                        } catch (e) {
                            console.log('locationChanged failed', e)
                        }
                    }}
                    onLocationsReady={(locations)=> {
                        // console.log("location total", locations.total);
                        this.setState({sliderDisabled : false});
                    }}
                    onReady={(book)=> {
                        console.log('onReady fired', book)
                        this.setState({
                            successLoaded: true
                        });
                        this.checkInitialLocation();
                        // this.defineBookLocations(book);
                        // clearInterval(interval);
                    }}
                    onPress={(cfi, position, rendition)=> {
                        console.log("press", cfi);
                        
                    }}
                    onLongPress={(cfi, rendition)=> {
                        console.log("longpress", cfi);
                    }}
                    onViewAdded={(index) => {
                        console.log("added", index)
                    }}
                    beforeViewRemoved={(index) => {
                        console.log("removed", index)
                    }}
                    onSelected={(cfiRange, rendition) => {
                        console.log("selected", cfiRange)
                        // Add marker
                        rendition.highlight(cfiRange, {});
                    }}
                    onMarkClicked={(cfiRange) => {
                        console.log("mark clicked", cfiRange)
                    }}
                    origin={this.state.origin}
                    onError={(message) => {
                        console.log("EPUBJS-Webview", message);
                    }}
                    />
                {this.state.nav_opened && (
                    <View style={styles.navigation}>
                        <View style={styles.navigation_header}>
                            <Text style={{padding: 15}}>Содержание книги</Text>
                            <TouchableOpacity onPress={() => this.setState({nav_opened: false})}>
                                <Ionicons style={{padding: 15}} name="ios-close-circle-outline" size={25} color="tomato" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.navigation_list}>
                            <FlatList
                                data={this.state.book_locations}
                                keyExtractor={item => String(item.id)}
                                renderItem={({item}) => (
                                    <View style={styles.navigation_list_row}>
                                        <View style={{maxWidth: '97%'}}>
                                        <TouchableOpacity onPress={() => this.setState({location: item.app_href, nav_opened: false})}>
                                            <View style={{flex: 1, height: "100%"}}>
                                                <Text>{item.title.trim()}</Text>
                                            </View>
                                        </TouchableOpacity>
                                        </View>
                                        {item.audiofile_id && (
                                            <TouchableOpacity onPress={() => this.redirectToAudio(item.audio_book_id, item.audiofile_id, item.audio_book_name)}>
                                                <View style={{flex: 0, alignItems: 'center', marginTop: -10}}>
                                                    <Ionicons name={"ios-volume-mute"} size={35} color="tomato" style={{marginTop: 5}}/>
                                                    <Text style={{fontSize: 10, marginTop: -10,}}>Слушать</Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                            >
                            </FlatList>
                        </View>
                    </View>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    reader: {
        flex: 1,
        alignSelf: 'stretch',
        backgroundColor: '#3F3F3C'
    },
    bar: {
        position:"absolute",
        left:0,
        right:0,
        height:55
    },
    navigation: {
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        flex: 1,
        backgroundColor: "#fff",
        height: "100%"
    },
    navigation_header: {
        // flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#eaeaea"
        // padding: 15,
    },
    navigation_list: {
        paddingBottom: 58
    },
    navigation_list_row: {
        padding: 10,
        paddingLeft: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eaeaea",
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    }
});

export default EpubReader;