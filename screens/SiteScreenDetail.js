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
import { getItems } from "../actions/site";

class SiteScreenDetail extends Component {
    static navigationOptions = {
        header: null
    };
    state = {
        page: 1,
    };
    _renderItem = ({ item }) => {
        return(
            <TouchableOpacity
                onPress={() => {
                    console.log("nav will here");
                }}
            >
                <View style={listStyles.quoteItem}>
                    <Text style={listStyles.quoteTitle}>{item.NAME}</Text>
                </View>
            </TouchableOpacity>
        )
    };
    _onEndReached = () => {
        console.log('_onEndReached fired')
        this.setState({
            page: this.state.page + 1,
        });
        setTimeout(() => {
            this.props.getItems(this.props.type, this.state.page);    
        }, 100);
    }
    _keyExtractor = item => {
        return item.title;
    };
    componentDidMount(){
        this.props.getItems(this.props.type, this.state.page)
    }
    render() {
        console.log("site screen detail props: ", this.props);
        let items = [];
        try{
            switch (this.props.type){
                case "read":
                items = this.props.site.read.items
                break;
                case "content":
                items = this.props.site.content.items
                break;
                case "look":
                items = this.props.site.look.items
                break;
                case "listen":
                items = this.props.site.listen.items
                break;
            }
        } catch(e) {console.log('crash', e)}
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
                        paddingBottom: 15,
                        paddingTop: 5,
                        flex: 0,
                        marginBottom: 43
                    }}
                    data={items}
                    renderItem={this._renderItem}
                    // onEndReached={this._onEndReached}
                    // onEndReachedThreshold={.7}
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
        site: state.siteReducer,
    };
};
const mapDispatchToProps = dispatch => {
    return {
        getItems: (type, offset) => dispatch(getItems(type, offset)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SiteScreenDetail);
