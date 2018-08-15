import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Animated,
  Modal,
  StatusBar,
  AsyncStorage
} from 'react-native';

import { Epub, Streamer } from "epubjs-rn";


class EpubReader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            flow: "scrolled-continuous", // paginated || scrolled-continuous
            location: 0,
            url: "https://s3.amazonaws.com/epubjs/books/moby-dick.epub",
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
        };
        this.streamer = new Streamer();
        console.log('constructor props: ', this.props)
    }
    static navigationOptions = ({navigation}) => {
        const bookName = navigation.getParam('book_name')
        return {
            headerTitle: bookName
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
            } else {
                console.log('async storage reader_locations value is empty', value);
            }
        })
    }

    componentWillUnmount() {
        console.log('epub reader unmount')
        this.streamer.kill();
    }

    toggleBars() {
        this.setState({ showBars: !this.state.showBars });
    }

    saveBookLocation(location, book_id){
        console.log('saveBookLocation', location, book_id)
    }

    render() {
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
                        if (visibleLocation.start.location){
                            if (visibleLocation.start.location != this.state.visibleLocation.start.location){
                                this.saveBookLocation(visibleLocation.start.location, this.state.book_id);
                            }
                        }
                        this.setState({visibleLocation});
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
                        // clearInterval(interval);
                    }}
                    onPress={(cfi, position, rendition)=> {
                        this.toggleBars();
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
    }
});

export default EpubReader;