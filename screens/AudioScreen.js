import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  AsyncStorage,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { API_URL } from '../constants/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { listStyles } from '../constants/list_styles';
import { connect } from "react-redux";
import { SafeAreaView } from "react-navigation";
import Pagination,{Icon,Dot} from 'react-native-pagination';//{Icon,Dot} also available
class AudioScreen extends Component {
    constructor(props){
      super(props);
      this.state = {
        books: [],
        date: Date.now(),
        refreshnig: false,
        online: true,
        loading: false,
      }
    }
    static navigationOptions = ({navigation}) => {
      const dim = Dimensions.get('window');
      return {
        headerStyle: (dim.height == 812 || dim.width == 812 || dim.height == 896 || dim.width == 896) ? {
          height: 65,
        } : {
        },
      }
    }
    // willFocusSubscription = this.props.navigation.addListener(
    //   'willFocus',
    //   payload => {
    //       this.getBooks();
    //   }
    // );
    _keyExtractor = (item) => item.id.toString();
    getBooks(){
        console.log('getBooks starts')
        let request = new XMLHttpRequest();
        this.setState({
          loading: true
        })
        request.onreadystatechange = (e) => {
            if (request.status === 200) {
                this.setState(state => {
                  if (request.responseText){
                    let parsedText;
                    try {
                      parsedText = JSON.parse(request.responseText);
                      return {
                        ...state,
                        books: parsedText,
                        online: true,
                        loading: false,
                      }
                    } catch (e){
                      console.log('catched parse json', request)
                      parsedText = [];
                    }
                }
                })
                AsyncStorage.setItem('cached_audio_list', request.responseText);
            } else {
              console.log('error req', API_URL + `/get-audio-books?lang=${this.props.main.lang}`, request)
              let cached_audio_list;
              if (this.props.main.lang == 'eng' || this.props.main.lang == 'en'){
                cached_audio_list = 'cached_audio_list_eng';
              } else if (this.props.main.lang == 'es') {
                cached_audio_list = 'cached_audio_list_es';
              } else {
                cached_audio_list = 'cached_audio_list';
              }
              AsyncStorage.getItem(cached_audio_list, (err, value) => {
                // console.log('cached_audio_list', value)
                if (!!value){
                    try {
                        this.setState({
                            books: JSON.parse(value),
                            online: false,
                            loading: false
                        })
                    } catch (e){
                        console.log('crash!', e)
                    }
                }
              });
            }
        };
        request.open('GET', API_URL + `/get-audio-books?lang=${this.props.main.lang}`);
        request.send();
    }
    componentDidMount(){
        this.getBooks();
    }
    shouldComponentUpdate(nextProps, nextState){
        if (this.state.books.length == nextState.books.length){
            return false;
        }
        return true;
    }
    onViewableItemsChanged = ({ viewableItems, changed }) =>{
      // console.log('onViewableItemsChanged', viewableItems)
      this.setState({viewableItems})
    }
    render() {
        console.log('render', this.state)
        let comp;
        if (this.state.books.length) {
          comp = (
            <SafeAreaView style={{flex: 1, backgroundColor: '#F5FCFF'}}>
                <FlatList
                    style={{paddingLeft: 10, paddingRight: 10}}
                    data={this.state.books}
                    ref={r=>this.refs=r}//create refrence point to enable scrolling
                    onViewableItemsChanged={this.onViewableItemsChanged}//need this
                    renderItem={({item}) => (
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('Audio', {book_id: item.id, book_name: item.name, book_src: item.file_src, online: this.state.online, lang: this.props.main.lang} )}>
                        <View style={listStyles.quoteItem}>
                            <Text style={listStyles.quoteTitle}>{item.name}</Text>
                            <View style={listStyles.quoteBottom}>
                                <View style={listStyles.quoteBottomText}>
                                    {item.text_short && (<Text style={{color: "#808080"}}>{item.description}</Text>)}
                                    <Text style={{marginTop: 10, color: '#c5c5c5', fontStyle: 'italic'}}>{item.author}</Text>
                                </View>
                                <View style={listStyles.arrowCircle}>
                                    <View style={listStyles.arrowCircleInside}>
                                        <Ionicons name="ios-arrow-forward" size={40} color="#fff"/>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                  )}
                  keyExtractor={this._keyExtractor}
                  onRefresh={() => this.getBooks()}
                  refreshing={false}
                >
                </FlatList>
                {/* <Pagination
                  // dotThemeLight //<--use with backgroundColor:"grey"
                  listRef={this.refs}//to allow React Native Pagination to scroll to item when clicked  (so add "ref={r=>this.refs=r}" to your list)
                  paginationVisibleItems={this.state.viewableItems}//needs to track what the user sees
                  paginationItems={this.state.books}//pass the same list as data
                  paginationItemPadSize={3} //num of items to pad above and below your visable items
                  // pagingEnabled={true}
                  paginationStyle={{width: 10, alignItems:"center", justifyContent: 'space-between', position:"absolute", margin:0, bottom:0, right:15, padding:0, top: 0, flex:1,}}
                  dotIconSizeActive={10}
                /> */}
            </SafeAreaView>
          );
        } else if (!!this.state.loading){
          comp = (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator />
            </View>
          )
        } else {
          comp = (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text>
                {this.props.main.lang == 'eng' || this.props.main.lang == 'en'
                  ? 'No data available'
                  : this.props.main.lang == 'es'
                  ? 'No hay datos disponibles'
                  : 'Данные отсутствуют'}
              </Text>
            </View>
          )
        }
        return comp;
    }
}
const mapStateToProps = state => {
  return {
      main: state.mainReducer,
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
)(AudioScreen);

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