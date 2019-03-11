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
    Linking,
    Easing
} from "react-native";
import { SITE_URL } from "../constants/api";
import TextTicker from "react-native-text-ticker";
// import { WebView } from "react-native-webview";
import WKWebView from "react-native-wkwebview-reborn";
import NavigationService from "../NavigationService";
import { connect } from "react-redux";
import { setTag } from "../actions/site";
const injectScript = `
// var originalPostMessage = window.postMessage;

// var patchedPostMessage = function(message, targetOrigin, transfer) { 
//   originalPostMessage(message, targetOrigin, transfer);
// };

// patchedPostMessage.toString = function() { 
//   return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage'); 
// };

// window.postMessage = patchedPostMessage;
  (function () {
    window.onclick = function(e) {
        console.log('window clicked');
      e.preventDefault();
      if (e.target.getAttribute('data-target') == 'similar') {
          var data = {
              type: 'similar',
              id: e.target.getAttribute('data-target-id'),
              title: e.target.getAttribute('data-target-title')
          }
          window.postMessage(data);
      } else if (e.target.getAttribute('data-target') == 'tag') {
        var data = {
            type: 'tag',
            id: e.target.getAttribute('data-target-id'),
            title: e.target.getAttribute('data-target-title'),
        }
        window.postMessage(data);
      } else if (e.target.href){
          window.postMessage(e.target.href);
        }
      e.stopPropagation()
    }
  }());
`;

class SiteScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        console.log("title length", navigation.getParam("title").length);
        return {
            // headerTitle: navigation.getParam("title"),
            // title:
            headerTitle: (
                <View>
                    <TextTicker
                        style={{ fontSize: 14 }}
                        duration={navigation.getParam("title").length * 238}
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
            rigth: null
        };
    };
    state = {};
    render() {
        console.log('id = ', this.props.navigation.getParam("id"));
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: "#efefef",
                    paddingBottom: 10,
                    paddingTop: 10
                }}
            >
                <WKWebView
                    source={{
                        uri:
                            SITE_URL +
                            `/detail.php?id=${this.props.navigation.getParam(
                                "id"
                            )}&test=1`
                    }}
                    style={{ backgroundColor: "#efefef" }}
                    // allowsInlineMediaPlayback={true}
                    // mediaPlaybackRequiresUserAction={true}
                    injectedJavaScript={injectScript}
                    onMessage={({ nativeEvent }) => {
                        console.log("onMessage", nativeEvent);
                        const data = nativeEvent.data;
                        if (typeof data == "string") {
                            if (data !== undefined && data !== null) {
                                Linking.openURL(data);
                            }
                        } else {
                            console.log("its obj?", data);
                            if (data.type == "similar") {
                                NavigationService.navigate("SiteDetail", {
                                    id: data.id,
                                    title: data.title
                                });
                            }
                            if (data.type == "tag") {
                                this.props.setTag({
                                    id: data.id,
                                    title: data.title,
                                    type: "tag"
                                });
                                NavigationService.navigate("SiteTabScreen", {
                                    id: data.id,
                                    title: data.title,
                                    type: "tag"
                                });
                            }
                        }
                    }}
                />
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
        setTag: tag => dispatch(setTag(tag))
        // getItems: (type, offset, q_str, action_type) =>
        // dispatch(getItems(type, offset, q_str, action_type))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SiteScreen);
