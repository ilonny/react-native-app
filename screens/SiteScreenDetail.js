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
    WebView
} from "react-native";
import { SITE_URL } from "../constants/api";

export default class SiteScreen extends Component {
    static navigationOptions = ({navigation}) => {
        return {
            headerTitle: navigation.getParam("id")
        }
    };
    state = {

    };
    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#efefef', paddingBottom: 10, paddingTop: 10}}>
                <WebView
                    source={{uri: SITE_URL + `/detail.php?id=${this.props.navigation.getParam("id")}`}}
                    style={{backgroundColor: '#efefef'}}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={true}
                />
            </SafeAreaView>
        );
    }
}