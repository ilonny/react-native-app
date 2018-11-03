import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  AsyncStorage,
  SafeAreaView,
  ScrollView,
  FlatList,
  WebView,
  TouchableOpacity,
  Share
} from 'react-native';
import { API_URL } from '../constants/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { listStyles } from '../constants/list_styles';

export default class DetailsScreen extends Component {
    constructor(props){
      super(props);
      this.state = {
          isFavorite: false,
          favorites: [],
          quote_id: this.props.navigation.getParam('quote_id', 'null'),
          title: this.props.navigation.getParam('title', 'null'),
          text_short: this.props.navigation.getParam('text_short', 'null'),
          text: this.props.navigation.getParam('text', 'null'),
          author_name: this.props.navigation.getParam('author_name', 'null'),
          online: this.props.navigation.getParam('online', 'false'),
        //   online: false,
      }
    }
    static navigationOptions = ({navigation}) => {
        const toggleFav = navigation.getParam('toggleFav');
        const consoleState = navigation.getParam('consoleState');
        const shareClick = navigation.getParam('shareClick');
        return {
            headerRight: (
                // <TouchableOpacity onPress={navigation.getParam('consoleState')}>
                <View style={{alignItems: 'center', flex: 1, flexDirection: 'row'}}>
                    <TouchableOpacity onPress={() => toggleFav(navigation.state.params.quote_id)}>
                        <Ionicons name={navigation.state.params.isFavorite ? "ios-heart" : "ios-heart-outline"}  size={25} color="tomato" style={{marginTop: 5}}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => shareClick()}>
                        <Ionicons name="ios-share-outline" size={25} color="tomato" style={{marginTop: 4, marginLeft: 10}}/>
                    </TouchableOpacity>
                </View>
            ),
            // title: 'test',
            headerStyle: {
                paddingRight: 10,
            },
        }
    }
    componentWillMount(){
        AsyncStorage.getItem('Favorites', (err,value) => {
            if (!value){
                fav_arr = [];
                console.log('storage values not found, state is eq to []')
                this.setState(state => {
                    return {
                        ...state,
                        isFavorite: false,
                    }
                })
                this.props.navigation.setParams({isFavorite: this.state.isFavorite});
                console.log('CWM state change to:', this.state)
            } else {
                this.setState(state => {
                    return {
                        ...state,
                        favorites: JSON.parse(value),
                        isFavorite: JSON.parse(value).includes(this.state.quote_id) ? true : false,
                    }
                })
                this.props.navigation.setParams({isFavorite: this.state.isFavorite});
                console.log('CWM state change to:', this.state)
            }
        })
    }
    shareClick = () => {
        console.log('share state', this.state)
        Share.share({
            message: this.state.text_short,
            url: API_URL + `/quote?id=${this.state.quote_id}`,
            title: this.state.title
          }, {
            // Android only:
            dialogTitle: 'Поделиться цитатой',
            // iOS only:
            excludedActivityTypes: [
              'com.apple.UIKit.activity.PostToTwitter'
            ]
          })
    }
    componentDidMount() {
        console.log("details screen component did mount state", this.state)
        // this.props.navigation.setParams({ increaseCount: this._increaseCount });
        this.props.navigation.setParams({toggleFav: this.toggleFav})
        this.props.navigation.setParams({consoleState: this.consoleState})
        this.props.navigation.setParams({shareClick: this.shareClick})
    }
    consoleState = () => {
        console.log(this.state);
    }
    toggleFav = (id) =>{
        console.log('toggle fav start', id)
        if (this.state.favorites.includes(id)){
            //delete from favs
            console.log('need to delete');
            let arr = [...this.state.favorites];
            console.log('arr', arr)
            let index = arr.indexOf(id);
            arr.splice(index, 1);
            console.log('arr2', arr)
            this.setState(state => {
                return {
                    ...state,
                    isFavorite: false,
                    favorites: arr,
                }
            })
            setTimeout(() => {
                console.log('state after tap', this.state)
                AsyncStorage.removeItem('Favorites');
                AsyncStorage.setItem('Favorites', JSON.stringify(this.state.favorites));
                this.props.navigation.setParams({isFavorite: this.state.isFavorite});
                this.forceUpdate();    
            }, 10);
        } else {
            //add to favs
            console.log('need to add');
            let arr = [...this.state.favorites];
            console.log('arr', arr)
            this.setState(state => {
                return {
                    ...state,
                    isFavorite: true,
                    favorites: state.favorites.concat(id),
                }
            })
            setTimeout(() => {
                console.log('state after tap', this.state)
                AsyncStorage.removeItem('Favorites');
                AsyncStorage.setItem('Favorites', JSON.stringify(this.state.favorites));
                this.props.navigation.setParams({isFavorite: this.state.isFavorite});
                this.forceUpdate();    
            }, 10);
        }
    }
    // shouldComponentUpdate(nextProps, nextState){
        // if (this.state.isFavorite == nextState.isFavorite){
        //     return false;
        // }
        // return true;
    // }
    componentDidUpdate(prevProps){
        console.log('prevProps', JSON.stringify(prevProps))
        console.log('nextProps', JSON.stringify(this.props))
        console.log('state_q_id? ', this.state.quote_id)
        console.log('props_q_id? ', this.props.navigation.state.params.quote_id)
        if (this.state.quote_id != this.props.navigation.state.params.quote_id){
            this.setState({quote_id: this.props.navigation.state.params.quote_id})
        }
    }
    render(){
        console.log('render start');
        console.log('detailsscreen props', JSON.stringify(this.props))
        console.log('detailsscreen state', JSON.stringify(this.state))
        const quote_id = this.state.quote_id;
        console.log('quote_id = ', quote_id);
        console.log('render end');
        let comp;
        if (this.state.online){
            comp = (
                <SafeAreaView style={{flex: 1, backgroundColor: '#efefef', paddingBottom: 10, paddingTop: 10}}>
                    <WebView
                        source={{uri: API_URL + `/quote?id=${quote_id}`}}
                        style={{backgroundColor: '#efefef'}}
                    />
                </SafeAreaView>
            );
        } else {
            comp = (
                <SafeAreaView style={{flex: 1, backgroundColor: '#efefef', padding: 10}}>
                    {/* <WebView
                        source={{uri: API_URL + `/quote?id=${quote_id}`}}
                        style={{backgroundColor: '#efefef'}}
                    /> */}
                    <Text style={[listStyles.quoteTitle, {textAlign: 'center', padding: 10}]}>{this.state.title}</Text>
                    <WebView
                        source={{html:
                                `<meta charset="UTF-8"/>
                                <meta name="viewport" content="width=device-width, maximum-scale=1, user-scalable=no" /> 
                                <meta name="theme-color" content="#202020">
                                <style>
                                    body{
                                        margin: 0;
                                        background-color: #efefef;
                                        padding: 10px
                                    }
                                    .container{
                                        padding: 0;
                                    }
                                    .body{
                                        padding: 10px 20px;
                                        background-color: #efefef;
                                    }
                                    .block{
                                        background-color: #fff;
                                        padding: 20px;
                                        border-radius: 20px;
                                        box-shadow: 0px 0px 10px 1px rgba(0,0,0,0.1);
                                    }
                                </style>                            
                             `+this.state.text}}
                        style={{backgroundColor: '#efefef'}}
                    />
                    {/* <Text style={{padding: 10}}>{this.state.text}</Text> */}
                    <Text style={{padding: 10, color: '#c5c5c5', fontStyle: 'italic'}}>{this.state.author_name}</Text>
                </SafeAreaView>
            )
        }
        return comp;
    }
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F5FCFF',
    },
    row: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 10,
      paddingTop: 25,
      paddingBottom: 25,
      borderBottomWidth: 1, 
      borderBottomColor: '#eaeaea'
    }
})