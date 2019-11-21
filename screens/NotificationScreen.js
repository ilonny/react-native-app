import React, { Component } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    ScrollView,
    FlatList,
    WebView,
    TouchableOpacity,
    Share,
    AsyncStorage
} from "react-native";
import { API_URL } from "../constants/api";
import Ionicons from "react-native-vector-icons/Ionicons";
import { listStyles } from "../constants/list_styles";
import { connect } from "react-redux";
import Hyperlink from "react-native-hyperlink";

class DetailsScreenContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isFavorite: false,
            favorites: [],
            quote_id: this.props.navigation.getParam("quote_id", "null"),
            title: this.props.navigation.getParam("title", "null"),
            text_short: this.props.navigation.getParam("text_short", "null"),
            text: this.props.navigation.getParam("text", "null"),
            author_name: this.props.navigation.getParam("author_name", "null"),
            online: this.props.navigation.getParam("online", "false")
            //   online: false,
        };
    }
    static navigationOptions = ({ navigation }) => {
        const toggleFav = navigation.getParam("toggleFav");
        const consoleState = navigation.getParam("consoleState");
        const shareClick = navigation.getParam("shareClick");
        return {
            headerRight: (
                // <TouchableOpacity onPress={navigation.getParam('consoleState')}>
                <View
                    style={{
                        alignItems: "center",
                        flex: 1,
                        flexDirection: "row"
                    }}
                ></View>
            ),
            // title: 'test',
            headerStyle: {
                paddingRight: 10
            }
        };
    };
    componentDidMount() {
        // console.log("details screen component did mount state", this.state)
        // this.props.navigation.setParams({ increaseCount: this._increaseCount });
        this.props.navigation.setParams({ toggleFav: this.toggleFav });
        this.props.navigation.setParams({ consoleState: this.consoleState });
        this.props.navigation.setParams({ shareClick: this.shareClick });
    }
    render() {
        console.log("notifications screen props", this.props);
        console.log("notifications screen state", this.state);
        return (
            <ScrollView style={{flex: 0}}>
                <View style={[listStyles.quoteItem]}>
                    <View>
                        <Hyperlink linkDefault={true} linkStyle={{fontWeight: 'bold', color: 'tomato'}}>
                            <Text style={{ color: "#75644f" }}>
                                {this.props.navigation.getParam("text")}
                            </Text>
                        </Hyperlink>
                    </View>
                </View>
            </ScrollView>
        );
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
)(DetailsScreenContainer);
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5FCFF"
    },
    row: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        paddingTop: 25,
        paddingBottom: 25,
        borderBottomWidth: 1,
        borderBottomColor: "#eaeaea"
    }
});