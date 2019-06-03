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
import { SafeAreaView } from "react-navigation";
import { API_URL } from '../constants/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { listStyles } from '../constants/list_styles';
import { connect } from "react-redux";
import Pagination,{Icon,Dot} from 'react-native-pagination';//{Icon,Dot} also available
class ListScreen extends Component {
  constructor(props){
    super(props);
    this.state = {
      items: [],
      storage: [],
      authors: [],
      quotes: [],
      quotes_all: [],
      test: '',
      k: 0,
      test2: '',
      date: Date.now(),
      refreshnig: false,
      online: true,
      pages_count: 0,
      current_page: 1,
      modalIsOpen: true,
    }
  }
  static navigationOptions = ({navigation}) => {
    const dim = Dimensions.get('window');
    const toggleSettings = navigation.getParam('toggleSettings');
    return {
      // headerTitle: "Цитаты",
      headerLeft: (
        // <TouchableOpacity onPress={navigation.getParam('consoleState')}>
        <View style={{alignItems: 'center', flex: 1, flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => toggleSettings()}>
                <Ionicons name={"ios-more"} size={30} color={'tomato'} style={{marginTop: 5, marginLeft: 15}}/>
            </TouchableOpacity>
        </View>
      ),
      headerRight: (
        // <TouchableOpacity onPress={navigation.getParam('consoleState')}>
        <View style={{alignItems: 'center', flex: 1, flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => navigation.navigate('Favorites')}>
                <Ionicons name={"ios-star"} size={30} color={'tomato'} style={{marginTop: 5, marginRight: 15}}/>
            </TouchableOpacity>
        </View>
      ),
      headerStyle: (dim.height == 812 || dim.width == 812 || dim.height == 896 || dim.width == 896) ? {
        height: 65
      } : {},
    }
  }
  willFocusSubscription = this.props.navigation.addListener(
    'willFocus',
    payload => {
      this.state.online && this.getSettings();
    }
  );
  getQuotes(){
    console.log('get quotes start', API_URL + `/quotes?items=[${this.state.items}]&lang=${this.props.main.lang}`)
    let request = new XMLHttpRequest();
    request.onreadystatechange = (e) => {
        if (request.readyState !== 4) {
          return;
        }
        if (request.status === 200) {
        let all_item = ["Все"];
        if (this.props.main.lang == 'eng' || this.props.main.lang == 'en'){
            all_item = ["All"];
        }
        if (this.props.main.lang == 'es'){
            all_item = ["Todos"];
        }
          this.setState(state => {
            return {
              ...state,
              quotes: request.responseText ? JSON.parse(request.responseText) : 'error network',
              quotes_all: request.responseText ? JSON.parse(request.responseText) : 'error network',
              authors: all_item.concat(Array.from(new Set(Array.from(JSON.parse(request.responseText), quote => quote.author_name)))),
              online: true
              // quotes: 'error network 200'
            }
          })
          if (this.props.main.lang == 'eng' || this.props.main.lang == 'en'){
            AsyncStorage.setItem('cache_quotes_list_eng', request.responseText);
          }  else if (this.props.main.lang == 'es') {
            AsyncStorage.setItem('cache_quotes_list_es', request.responseText);
          } else {
            AsyncStorage.setItem('cache_quotes_list', request.responseText);
          }
        } else {
          console.log('error req')
          let all_item = ["Все"];
          if (this.props.main.lang == 'eng' || this.props.main.lang == 'en'){
              all_item = ["All"];
          }
          if (this.props.main.lang == 'es'){
              all_item = ["Todos"];
          }
          // this.setState(state => {
          //   return {
          //     ...state,
          //     quotes: API_URL + `/quotes?items=[${this.state.items}]`
          //   }
          // })
          if (this.props.main.lang == 'eng' || this.props.main.lang == 'en'){
            AsyncStorage.getItem('cache_quotes_list_eng', (err, value) => {
              // console.log('cache_quotes_list', value)
              if (!!value){
                this.setState({
                  quotes: JSON.parse(value),
                  quotes_all: JSON.parse(value),
                  authors: all_item.concat(Array.from(new Set(Array.from(JSON.parse(request.responseText), quote => quote.author_name)))),
                  online: false,
                })
              }
              this.setPagination();
            });
          } else if (this.props.main.lang == 'es'){
            AsyncStorage.getItem('cache_quotes_list_es', (err, value) => {
              // console.log('cache_quotes_list', value)
              if (!!value){
                this.setState({
                  quotes: JSON.parse(value),
                  quotes_all: JSON.parse(value),
                  authors: all_item.concat(Array.from(new Set(Array.from(JSON.parse(request.responseText), quote => quote.author_name)))),
                  online: false,
                })
              }
              this.setPagination();
            });
          } else {
            AsyncStorage.getItem('cache_quotes_list', (err, value) => {
              // console.log('cache_quotes_list', value)
              if (!!value){
                this.setState({
                  quotes: JSON.parse(value),
                  quotes_all: JSON.parse(value),
                  authors: all_item.concat(Array.from(new Set(Array.from(JSON.parse(value), quote => quote.author_name)))),
                  online: false,
                })
              }
              this.setPagination();
            });
          }
        }
        this.setPagination();
    };
    request.open('GET', API_URL + `/quotes?items=[${this.state.items}]&lang=${this.props.main.lang}`);
    request.send();
  }
  setPagination(){
    let quotes_count = this.state.quotes.length;
    this.setState({
      pages_count: Math.ceil(quotes_count/20)
    });
  }
  setPage(page_number){
    this.setState({
      current_page: page_number
    })
  }
  getSettings(){
    AsyncStorage.getItem('Settings', (err,value) => {
      if (value && value.length){
        this.setState(state => {
          return {
            ...state,
            items: JSON.parse(value),
            storage: value,
            test: 'Comp will mount here',
            date: Date.now()
          }
        });
        if (value != '[]'){
          this.getQuotes();
        }
      } else {
        this.setState(state => {
          return {
            ...state,
            // storage: '[]',
            items: 'all'
          }
        });
        this.getQuotes();
      }
    });
  }
  componentWillMount(){
    this.getSettings();
    this.initialStart();
  }
  toggleSettings = () => {
    this.setState({
        modalIsOpen: !this.state.modalIsOpen
    })
  }
  componentDidMount(){
    // AsyncStorage.clear();
    // console.log('remove global after app start downloading');
    let ASglobal_downloading;
    if (this.props.main.lang == 'eng' || this.props.main.lang == 'en'){
      ASglobal_downloading = 'global_downloading_eng';
    } else if (this.props.main.lang == 'es') {
      ASglobal_downloading = 'global_downloading_es';
    } else {
      ASglobal_downloading = 'global_downloading';
    }
    AsyncStorage.removeItem(ASglobal_downloading);
    this.props.navigation.setParams({toggleSettings: this.toggleSettings})
  }
  _keyExtractor = (item) => item.id ? item.id.toString() : '';
  refresh(){
    console.log('refresh')
    this.setState(state => {
      return {
        ...state,
        refreshing: true,
      }
    })
    let request = new XMLHttpRequest();
    request.onreadystatechange = (e) => {
        if (request.readyState !== 4) {
          return;
        }
        if (request.status === 200) {
          this.setState(state => {
            return {
              ...state,
              quotes: request.responseText ? JSON.parse(request.responseText) : 'error network',
              refreshing: false,
              online: true
              // quotes: 'error network 200'
            }
          })
          if (this.props.main.lang == 'eng' || this.props.main.lang == 'en'){
            AsyncStorage.setItem('cache_quotes_list_eng', request.responseText);
          } else if (this.props.main.lang == 'es') {
            AsyncStorage.setItem('cache_quotes_list_es', request.responseText);
          } else {
            AsyncStorage.setItem('cache_quotes_list', request.responseText);
          }
        } else {
          this.setState(state => {
            return {
              ...state,
              quotes: API_URL + `/quotes?items=[${this.state.items}]`,
              online: false
            }
          })
          if (this.props.main.lang == 'eng' || this.props.main.lang == 'en'){
            AsyncStorage.getItem('cache_quotes_list_eng', (err, value) => {
              console.log('cache_quotes_list_eng', value)
              if (!!value){
                this.setState({
                  quotes: JSON.parse(value),
                  online: false,
                })
              }
              this.setPagination();
            });
          } else if (this.props.main.lang == 'es') {
            AsyncStorage.getItem('cache_quotes_list_es', (err, value) => {
              console.log('cache_quotes_list', value)
              if (!!value){
                this.setState({
                  quotes: JSON.parse(value),
                  online: false,
                })
              }
              this.setPagination();
            });
          } else {
            AsyncStorage.getItem('cache_quotes_list', (err, value) => {
              console.log('cache_quotes_list', value)
              if (!!value){
                this.setState({
                  quotes: JSON.parse(value),
                  online: false,
                })
              }
              this.setPagination();
            });
          }
        }
    };
    request.open('GET', API_URL + `/quotes?items=[${this.state.items}]&lang=${this.props.main.lang}`);
    request.send();
  }
  //initial start
  initialStart(){
    AsyncStorage.getItem('first_runninig', (err, value) => {
      console.log('first_runninig', value)
      if (!value){
        console.log('getBooks  audio starts')
        let request = new XMLHttpRequest();
        request.onreadystatechange = (e) => {
            if (request.status === 200) {
              // console.log('audio is downloaded'git, request.responseText);
                AsyncStorage.setItem('cached_audio_list', request.responseText);
            } else {
              console.log('error audio is downloaded', API_URL + `/get-audio-books`);
            }
        };
        request.open('GET', API_URL + `/get-audio-books`);
        request.send();
        //
        console.log('getBooks reader starts')
        let request2 = new XMLHttpRequest();
        request2.onreadystatechange = (e) => {
            if (request2.status === 200) {
                AsyncStorage.setItem('cache_reader_list', request2.responseText);
            }
        };
        request2.open('GET', API_URL + `/get-reader-books`);
        request2.send();
      }
    });
  }
  //
  onViewableItemsChanged = ({ viewableItems, changed }) =>{
    console.log('onViewableItemsChanged', viewableItems)
    this.setState({viewableItems})
  }
  filterQuotes(author_name){
    console.log('filter quotes', author_name)
    if (author_name == 'Все' || author_name == 'All' || author_name == 'Todos') {
      this.setState({
        quotes: this.state.quotes_all,
        modalIsOpen: false
      })
    } else {
      let q = [].concat(this.state.quotes_all);
      q = q.filter(item => item.author_name == author_name)
      this.setState({
        quotes: q,
        modalIsOpen: false
      })
    }
  }
  render() {
    let comp;    
    // let quotes = this.state.quotes;
    console.log('render state', this.state)
    // console.log('render props', this.props)
    // quotes = [...new Set(quotes)];
    // let pagination_arr = [];
    // quotes_on_page = quotes.splice((this.state.current_page-1)*20, 20);
    // if (this.state.pages_count){
    //   for (let i = 1; i <= this.state.pages_count; i++){
    //     pagination_arr.push(i);
    //   }
    // }
    if (this.state.storage != '[]'){
      if (this.state.quotes) {
      comp = (
        <SafeAreaView   style={{flex: 1, backgroundColor: '#efefef', justifyContent:'space-between'}}>
            <FlatList
              style={{paddingLeft: 10, paddingRight: 10, paddingBottom: 5, paddingTop: 5, flex: 0}}
              // data={quotes_on_page}
              data={this.state.quotes}
              ref={r=>this.refs=r}//create refrence point to enable scrolling
              onViewableItemsChanged={this.onViewableItemsChanged}//need this
              renderItem={({item}) => (
                <TouchableOpacity onPress={() => this.props.navigation.navigate('Details', {quote_id: item.id, text_short: item.text_short, title: item.title, text: item.text, online: this.state.online, author_name: item.author_name} )}>
                  <View style={listStyles.quoteItem}>
                    <Text style={listStyles.quoteTitle}>{item.title}</Text>
                    <View style={listStyles.quoteBottom}>
                      <View style={listStyles.quoteBottomText}>
                        {item.text_short && (<Text style={{color: "#808080"}}>{item.text_short}</Text>)}
                        <Text style={{marginTop: 10, color: '#c5c5c5', fontStyle: 'italic'}}>{item.author_name}</Text>
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
              onRefresh={() => this.state.online && this.refresh()}
              refreshing={false}
            >
            </FlatList>
            {this.state.quotes.length > 1 && (
              <Pagination
                // dotThemeLight //<--use with backgroundColor:"grey"
                listRef={this.refs}//to allow React Native Pagination to scroll to item when clicked  (so add "ref={r=>this.refs=r}" to your list)
                paginationVisibleItems={this.state.viewableItems ? this.state.viewableItems : []}//needs to track what the user sees
                paginationItems={this.state.quotes ? this.state.quotes : []}//pass the same list as data
                paginationItemPadSize={3} //num of items to pad above and below your visable items
                // pagingEnabled={true}
                paginationStyle={{width: 10, alignItems:"center", justifyContent: 'space-between', position:"absolute", margin:0, bottom:0, right:15, padding:0, top: 0, flex:1,}}
                dotIconSizeActive={10}
              />
            )}
            {this.state.modalIsOpen && (
              <View style={styles.navigation}>
                <View style={styles.navigation_header}>
                  <Text>
                    {this.props.main.lang == 'eng' || this.props.main.lang == 'en'
                      ? 'Filters'
                      : this.props.main.lang == 'es'
                      ? 'Filtros'
                      : 'Цитаты по авторам'}
                    </Text>
                </View>
                <View style={styles.navigation_list}>
                <FlatList
                  data={this.state.authors}
                  keyExtractor={item => item}
                  renderItem={({item}) => (
                      <View style={styles.navigation_list_row}>
                          <View style={{maxWidth: '100%'}}>
                            <TouchableOpacity onPress={() => this.filterQuotes(item)}>
                                <View style={{flex: 1, height: "100%"}}>
                                    <Text>{item}</Text>
                                </View>
                            </TouchableOpacity>
                          </View>
                      </View>
                  )}
              >
              </FlatList>
                </View>
              </View>
            )}
            {/* {this.state.pages_count && (
              <View style={{backgroundColor: '#fff'}}>
                <FlatList
                  data={pagination_arr}
                  horizontal={true}
                  keyExtractor={(item) => item.toString()}
                  contentContainerStyle={[styles.pagination, {flex: this.state.pages_count > 10 ? 0 : 1}]}
                  renderItem = {({item}) => (
                    <TouchableOpacity key={item} onPress={() => this.setPage(item)}>
                      <View style={{
                        padding: 5,
                        borderRadius: 5,
                        borderWidth: 1,
                        borderColor: 'red',
                        margin: 5,
                        backgroundColor: this.state.current_page == item ? 'red' : 'white',
                      }}>
                        <Text style={{
                          fontSize: 10,
                          color: this.state.current_page == item ? 'white' : 'black',
                        }}>{item}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                >
                </FlatList>
              </View>
            )} */}
        </SafeAreaView>
      );
      } else {
        comp =(
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator />
          </View>
        )
    }
    } else {
      comp = (
        <View style={styles.container}>
          <Text style={{textAlign: 'center'}}>Пожалуйста, укажите желаемые источники в разделе "Настройки"</Text>
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
)(ListScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
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
  },
  pagination: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  navigation: {
      position: "absolute",
      left: 0,
      top: 0,
      right: 0,
      flex: 1,
      backgroundColor: "#fff",
      height: "100%"
  },
  navigation_header: {
      // flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#eaeaea",
      padding: 15,
  },
  navigation_list: {
      paddingBottom: 58
  },
  navigation_list_row: {
      padding: 10,
      paddingLeft: 15,
      borderBottomWidth: 1,
      borderBottomColor: "#eaeaea",
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
  },
})