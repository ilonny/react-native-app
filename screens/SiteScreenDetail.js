import React, { Component } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    View,
    AsyncStorage,
    SafeAreaView,
    ScrollView,
    FlatList,
    TouchableOpacity,
    Dimensions,
    Animated,
    TextInput
} from "react-native";
import { connect } from "react-redux";
import { listStyles } from "../constants/list_styles";

class SiteScreenDetail extends Component {
    static navigationOptions = {
        header: null
    };
    state = {};
    _renderItem = ({ item }) => {
        return(
            <TouchableOpacity
                onPress={() => {
                    console.log("nav will here");
                }}
            >
                <View style={listStyles.quoteItem}>
                    <Text style={listStyles.quoteTitle}>{item.title}</Text>
                </View>
            </TouchableOpacity>
        )
    };
    _keyExtractor = item => {
        return item.title;
    };
    render() {
        console.log("site screen detail props: ", this.props.site.news.items);
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: "#efefef"
                }}
            >
                <View
                    style={[
                        listStyles.quoteItem,
                        {
                            marginLeft: 10,
                            marginRight: 10,
                            marginBottom: 5,
                            marginTop: 5,
                            flex: 0,
                            padding: 8
                        }
                    ]}
                >
                    <TextInput placeholder="Поиск" />
                </View>
                <View>
                <FlatList
                    style={{
                        paddingLeft: 10,
                        paddingRight: 10,
                        paddingBottom: 5,
                        paddingTop: 5,
                        flex: 0
                    }}
                    data={this.props.site.news.items}
                    extraData={this.props.site.news.items}
                    renderItem={this._renderItem}
                    keyExtractor={this._keyExtractor}
                    refreshing={false}
                    />
                </View>
            </SafeAreaView>
        );
    }
}
const mapStateToProps = state => {
    return {
        site: state.siteReducer
    };
};
const mapDispatchToProps = dispatch => {
    return {
        // setNeedToDownload: arr => dispatch(setNeedToDownload(arr)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SiteScreenDetail);
