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
    WebView,
    Linking
} from "react-native";
import { SITE_URL } from "../constants/api";

const injectScript = `
var originalPostMessage = window.postMessage;

var patchedPostMessage = function(message, targetOrigin, transfer) { 
  originalPostMessage(message, targetOrigin, transfer);
};

patchedPostMessage.toString = function() { 
  return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage'); 
};

window.postMessage = patchedPostMessage;
  (function () {
    window.onclick = function(e) {
      e.preventDefault();
      window.postMessage(e.target.href);
      e.stopPropagation()
    }
  }());
`;

export default class SiteScreen extends Component {
    static navigationOptions = ({navigation}) => {
        return {
            headerTitle: navigation.getParam("title"),
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
                    injectedJavaScript={injectScript}
                    onMessage={({ nativeEvent }) => {
                        const data = nativeEvent.data;
                        if (data !== undefined && data !== null) {
                            Linking.openURL(data);
                        }
                    }}
                />
            </SafeAreaView>
        );
    }
}