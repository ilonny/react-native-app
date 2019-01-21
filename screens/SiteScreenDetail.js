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
    Linking,
    Easing,
} from "react-native";
import { SITE_URL } from "../constants/api";
import TextTicker from "react-native-text-ticker";

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
    static navigationOptions = ({ navigation }) => {
        console.log('title length', navigation.getParam("title").length);
        return {
            // headerTitle: navigation.getParam("title"),
            // title:
            headerTitle: (
                <View >
                    <TextTicker
                        style={{ fontSize: 14 }}
                        duration={navigation.getParam("title").length*238}
                        loop
                        bounce
                        repeatSpacer={50}
                        marqueeDelay={1000}
                        easing={Easing.linear}
                        >
                        {navigation.getParam("title")}
                    </TextTicker>
                </View>
            ),
            rigth: null,
        };
    };
    state = {};
    render() {
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: "#efefef",
                    paddingBottom: 10,
                    paddingTop: 10
                }}
            >
                <WebView
                    source={{
                        uri:
                            SITE_URL +
                            `/detail.php?id=${this.props.navigation.getParam(
                                "id"
                            )}`
                    }}
                    style={{ backgroundColor: "#efefef" }}
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