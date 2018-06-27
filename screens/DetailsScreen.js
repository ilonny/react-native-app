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
  TouchableHighlight,
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
      }
    }
    static navigationOptions = ({navigation}) => {
        return {
            headerRight: (
                <TouchableHighlight onPress={() => console.log('pressed '+ navigation.state.params.quote_id)}>
                    <Ionicons name={navigation.state.params.isFavorite ? "ios-heart" : "ios-heart-outline"}  size={25} color="tomato" style={{marginTop: 5}}/>
                </TouchableHighlight>
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
    toggleFav(id){
        if (this.state.favorites.includes(id)){
            let arr = [...this.state.selectedItems];
            let index = arr.indexOf(id);
            arr.splice(index, 1);
        }
    }
    render(){
        console.log('detailsscreen props', this.props)
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