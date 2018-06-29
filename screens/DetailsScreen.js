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

export default class DetailsScreen extends Component {
    constructor(props){
      super(props);
      this.state = {
          isFavorite: false,
          favorites: [],
          quote_id: this.props.navigation.getParam('quote_id', 'null'),
          title: this.props.navigation.getParam('title', 'null'),
          text_short: this.props.navigation.getParam('text_short', 'null'),
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
        console.log("component did mount state", this.state)
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
    shouldComponentUpdate(nextProps, nextState){
        if (this.state.isFavorite == nextState.isFavorite){
            return false;
        }
        return true;
    }
    render(){
        console.log('render start');
        console.log('detailsscreen props', this.props)
        console.log('detailsscreen state', this.state)
        console.log('render end');
        const quote_id = this.state.quote_id;
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#F5FCFF', paddingBottom: 10, paddingTop: 10}}>
                <WebView source={{uri: API_URL + `/quote?id=${quote_id}`}}
                />
            </SafeAreaView>
        )
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