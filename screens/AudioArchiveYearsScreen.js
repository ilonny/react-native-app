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

export default class ArchiveAuthorsYearsScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            years: [],
            online: true,
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
    componentDidMount() {
        // AsyncStorage.clear();
        // this.getAuthorsData();
        this.setState({
            years: this.props.navigation.getParam("years"),
            online: this.props.navigation.getParam("online"),
        });
    }
    downloadCoverQueue() {
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
    _keyExtractor = item => item.year.toString();
    render() {
        console.log("render state", this.state);
        const { years } = this.state;
        let comp = <ActivityIndicator />;
        if (years.length) {
            comp = (
                <SafeAreaView>
                    <FlatList
                        style={{
                            // paddingLeft: 10,
                            // paddingRight: 10,
                            paddingBottom: 5,
                            paddingTop: 5,
                            flex: 0
                        }}
                        data={years}
                        ref={r => (this.refs = r)}
                        onViewableItemsChanged={this.onViewableItemsChanged} //need this
                        keyExtractor={this._keyExtractor}
                        // onRefresh={() => this.getAuthorsData()}
                        // refreshing={false}
                        renderItem={({ item }) => {
                            return (
                                <TouchableOpacity
                                    onPress={() =>
                                        this.props.navigation.navigate(
                                            "AudioArchiveAudio",
                                            { audio: item.audio, author_id: item.author_id, online: this.state.online }
                                        )
                                    }
                                >
                                    <View style={listStyles.quoteItem}>
                                        <View>
                                            <View style={listStyles.bookTop}>
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
                                                        {item.year}
                                                    </Text>
                                                </View>
                                                <View
                                                    style={
                                                        listStyles.arrowCircle
                                                    }
                                                >
                                                    <View
                                                        style={
                                                            listStyles.arrowCircleInside
                                                        }
                                                    >
                                                        <Ionicons
                                                            name="ios-arrow-forward"
                                                            size={40}
                                                            color="#fff"
                                                        />
                                                    </View>
                                                </View>
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
                        paginationItems={this.state.years} //pass the same list as data
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
        return comp;
    }
}

// const mapStateToProps = state => {
//     return {
//         main: state.mainReducer
//     };
// };
// const mapDispatchToProps = dispatch => {
//     return {
//         // setLangInside: lang => dispatch(setLangInside(lang))
//     };
// };

// export default connect(
//     mapStateToProps,
//     mapDispatchToProps
// )(ArchiveAuthorsYearsScreen);