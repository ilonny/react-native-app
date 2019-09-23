import React, { Component } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    View,
    AsyncStorage,
    ScrollView,
    FlatList,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Image
} from "react-native";
import { SafeAreaView } from "react-navigation";
import { API_URL } from "../constants/api";
import Ionicons from "react-native-vector-icons/Ionicons";
import { listStyles } from "../constants/list_styles";
import RNFetchBlob from "rn-fetch-blob";
import { connect } from "react-redux";
import Pagination, { Icon, Dot } from "react-native-pagination"; //{Icon,Dot} also available

class ArchiveAuthorsListScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            authors: [],
            downloaded_covers: [],
            covers_fired: false,
            get_data_fired: false,
        };
    }
    static navigationOptions = ({ navigation }) => {
        const dim = Dimensions.get("window");
        const toggleSettings = navigation.getParam("toggleSettings");
        return {
            headerStyle:
                dim.height == 812 ||
                dim.width == 812 ||
                dim.height == 896 ||
                dim.width == 896
                    ? {
                          height: 65
                      }
                    : {}
        };
    };
    counter = 0;
    getAuthorsData() {
        let request = new XMLHttpRequest();
        
        if (this.state.get_data_fired) {
            console.log('return false');
            return false;
        }
        // return false;
        request.onreadystatechange = e => {
            if (request.status === 200) {
                console.log('getAuthorsData()', this.counter);
                this.counter++;
                try {
                        this.setState({
                            get_data_fired: true,
                            authors: JSON.parse(request.responseText)
                                ? JSON.parse(request.responseText)
                                : [],
                            online: true
                        });
                        AsyncStorage.setItem("arhive_audio_data", request.responseText);
                    console.log("success", request);
                } catch (e) {
                    console.log("parse crashed", e);
                }
            } else {
                console.log("error AS", request);
                // AsyncStorage.getItem("arhive_audio_data", (err, value) => {
                //     try {
                //         this.setState({
                //             authors: JSON.parse(value) ? JSON.parse(value) : [],
                //             online: false
                //         });
                //     } catch (e) {
                //         console.log("parse offline crased");
                //     }
                // });
            }
            if (!this.state.covers_fired && (this.state.authors.length != this.state.downloaded_covers.length)) {
                try {
                    this.downloadCovers();
                    this.setState({
                        covers_fired: true
                    });    
                } catch (error) {
                    console.log('line 83 crashed')
                }
            }
        };
        this.setState({
            get_data_fired: true,
        })
        if (!this.state.get_data_fired){
            request.open(
                "GET",
                `https://harekrishna.ru/mobile-api/archive-main-list.php`
                );
                request.send();
        }
    }
    componentDidMount() {
        // AsyncStorage.clear();
        this.getAuthorsData();
        this.need_to_download_covers = [];
    }
    downloaded_covers = [];
    downloadCovers() {
        // return false;
        console.log("downloadCovers() fired");
        let ASdownloaded_covers;
        ASdownloaded_covers = "downloaded_covers_archive";
        AsyncStorage.getItem(ASdownloaded_covers, (err, value) => {
            console.log("downloaded_covers value", value);
            if (value) {
                this.downloaded_covers = JSON.parse(value);
                let File = this.downloaded_covers[0];
                RNFetchBlob.fs
                    .exists(File.file_path)
                    .then(exist => {
                        console.log(`file ${exist ? "" : "not"} exists`);
                        if (!exist) {
                            this.downloaded_covers = [];
                            this.need_to_download_covers = [].concat(
                                this.state.authors
                            );
                            this.downloadCoverQueue();
                        } else {
                            this.setState({
                                downloaded_covers: this.downloaded_covers
                            });
                            if (
                                this.state.authors.length !=
                                this.downloaded_covers.length
                            ) {
                                this.need_to_download_covers = [];
                                this.state.authors.forEach(book => {
                                    let isDownloaded = false;
                                    this.downloaded_covers.forEach(cover => {
                                        if (book.id == cover.id) {
                                            isDownloaded = true;
                                        }
                                    });
                                    if (!isDownloaded) {
                                        this.need_to_download_covers.push(book);
                                    }
                                });
                                this.downloadCoverQueue();
                            }
                        }
                    })
                    .catch(() => {
                        console.log("RNFB error");
                    });
            } else {
                this.downloaded_covers = [];
                this.need_to_download_covers = [].concat(this.state.authors);
                this.downloadCoverQueue();
            }
        });
    }
    downloadCoverQueue() {
        // return true;
        if (this.need_to_download_covers.length) {
            console.log(
                "this.need_to_download_covers",
                this.need_to_download_covers
            );
            let book_to_download = this.need_to_download_covers[0];
            console.log("book_to_download", book_to_download);
            this.task = RNFetchBlob.config({
                fileCache: true,
                appendExt: "jpg"
            }).fetch("GET", book_to_download.img_src, {});
            this.task.progress((received, total) => {
                console.log("progress", received / total);
            });
            this.task.then(res => {
                console.log("The file saved to ", res.path());
                this.downloaded_covers.push({
                    id: book_to_download.id,
                    file_path: res.path()
                });
                let ASdownloaded_covers;
                ASdownloaded_covers = "downloaded_covers_arhive";
                AsyncStorage.setItem(
                    ASdownloaded_covers,
                    JSON.stringify(this.downloaded_covers)
                );
                this.setState({
                    downloaded_covers: this.downloaded_covers
                });
                this.need_to_download_covers.shift();
                this.downloadCoverQueue();
            });
        } else {
            this.setState({
                downloaded_covers: this.downloaded_covers
            });
        }
    }
    onViewableItemsChanged = ({ viewableItems, changed }) => {
        console.log("onViewableItemsChanged", viewableItems);
        this.setState({ viewableItems });
    };
    _keyExtractor = item => item.id.toString();
    render() {
        console.log("render state", this.state);
        const { authors } = this.state;
        let comp = <ActivityIndicator />;
        try {
            if (authors && authors.length) {
                comp = (
                    <SafeAreaView>
                        <FlatList
                            style={{
                                paddingLeft: 10,
                                paddingRight: 10,
                                paddingBottom: 5,
                                paddingTop: 5,
                                flex: 0
                            }}
                            data={authors}
                            ref={r => (this.refs = r)}
                            onViewableItemsChanged={this.onViewableItemsChanged} //need this
                            keyExtractor={this._keyExtractor}
                            onRefresh={() => this.getAuthorsData()}
                            refreshing={false}
                            renderItem={({ item }) => {
                                let img_src = null;
                                let view;
                                this.state.downloaded_covers.forEach(cover => {
                                    if (item.id == cover.id) {
                                        img_src = cover.file_path;
                                        // console.log('render item 1')
                                        view = (
                                            <View style={{ marginRight: 10 }}>
                                                <Image
                                                    source={{ uri: img_src }}
                                                    style={{
                                                        width: 80,
                                                        height: 120
                                                    }}
                                                />
                                            </View>
                                        );
                                    }
                                });
                                if (this.state.online && !img_src) {
                                    img_src =
                                        "https://app.harekrishna.ru/" +
                                        item.img_src;
                                    view = (
                                        <View style={{ marginRight: 10 }}>
                                            <Image
                                                source={{ uri: img_src }}
                                                style={{ width: 80, height: 120 }}
                                            />
                                        </View>
                                    );
                                }
                                if (!this.state.online && !img_src) {
                                    view = null;
                                    // console.log('render item 2')
                                }
                                return (
                                    <TouchableOpacity
                                        onPress={() =>
                                            this.props.navigation.navigate(
                                                "AudioArchiveYears",
                                                { years: item.years, online: this.state.online }
                                            )
                                        }
                                    >
                                        <View style={listStyles.quoteItem}>
                                            <View>
                                                <View style={listStyles.bookTop}>
                                                    {view}
                                                    <View
                                                        style={{
                                                            flexWrap: "wrap",
                                                            flex: 1
                                                        }}
                                                    >
                                                        <Text
                                                            style={
                                                                listStyles.quoteTitle
                                                            }
                                                        >
                                                            {this.props.main.lang == 'ru' ? item.name : item.name_eng}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View>
                                                    <Text
                                                        style={{
                                                            marginTop: 10,
                                                            color: "#969595",
                                                            fontStyle: "italic"
                                                        }}
                                                    >
                                                        {this.props.main.lang == 'ru' ? item.preview_text : item.preview_text_eng}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                        <Pagination
                            // dotThemeLight //<--use with backgroundColor:"grey"
                            listRef={this.refs} //to allow React Native Pagination to scroll to item when clicked  (so add "ref={r=>this.refs=r}" to your list)
                            paginationVisibleItems={this.state.viewableItems} //needs to track what the user sees
                            paginationItems={this.state.authors} //pass the same list as data
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
                    </SafeAreaView>
                );
            }
        } catch (e) {
            console.log('crash', e)
        }
        return comp;
    }
}

const mapStateToProps = state => {
    return {
        main: state.mainReducer
    };
};
const mapDispatchToProps = dispatch => {
    return {
        // setLangInside: lang => dispatch(setLangInside(lang))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ArchiveAuthorsListScreen);
