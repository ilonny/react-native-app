import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  SectionList,
  Switch,
  ScrollView,
  AsyncStorage
} from 'react-native';

import { API_URL } from '../constants/api';
import { listStyles } from '../constants/list_styles';
export default class SettingsScreen extends Component {
    constructor(){
        super();
        this.state = {
            settings: [],
            items: [],
            authors: [],
            books: [],
            selectedItems: [],
            testString: '',
            asyncSettings: null,
            apiText: '',
            token: '',
        };
        // this.switchToggle(id) = this.switchToggle(id).bind(this)
    }
    static navigationOptions = {
        title: 'Настройки'
    }
    componentWillMount(){
        // AsyncStorage.removeItem('Settings');
        let request = new XMLHttpRequest();
        request.onreadystatechange = (e) => {
            if (request.readyState !== 4) {
              return;
            }
            if (request.status === 200) {
                //получим ответ от сервера и разложим в стейт данные
                this.setState(state => {
                    return {
                        ...state,
                        items: JSON.parse(request.responseText).all_items,
                        authors: JSON.parse(request.responseText).authors,
                        books: JSON.parse(request.responseText).books,
                        apiText: JSON.stringify(request.responseText)
                    }
                });
                //проверим если до этого ничего не было выбрано то выберем все и сохраним и в стейт, и в сторедж
                AsyncStorage.getItem('Settings', (err,value) => {
                    if (!value){
                        this.setState(state => {
                            return {
                                ...state,
                                selectedItems: state.items.map(el => el.id),
                                testString: 'test1',
                            }
                        })
                    } else {
                        this.setState(state => {
                            return {
                                ...state,
                                selectedItems: JSON.parse(value),
                                testString: value,
                            }
                        })
                        AsyncStorage.removeItem('Settings');
                        AsyncStorage.setItem('Settings', JSON.stringify(this.state.selectedItems));
                    }
                });
                AsyncStorage.getItem('Settings', (err, value) => {
                    this.setState(state => {
                        return {
                            ...state,
                            asyncSettings: this.state.selectedItems,
                        }
                    })
                })
            } else {
                this.setState(state => {
                    return {
                        ...state,
                        apiText: request.responseText
                    }
                });
            }
        };
        request.open('GET', API_URL + '/items');
        request.send();
        AsyncStorage.getItem('Token', (err, value) => {
            let token = value ? value : "test-token";
            this.setState(state => {
                return {
                    ...state,
                    token: token,
                }
            })
        })
        // console.log('token state?', this.state)
    }
    switchToggle(id){
        if (this.state.selectedItems.includes(id)){
            // console.log('need delete item', id)
            let arr = [...this.state.selectedItems];
            let index = arr.indexOf(id);
            arr.splice(index, 1);
            this.setState(state => {
                return {
                    ...state,
                    selectedItems: arr,
                    testString: 'delete1',
                    asyncSettings: arr,
                }
            })
            AsyncStorage.removeItem('Settings');
            AsyncStorage.setItem('Settings', JSON.stringify(arr));
        } else {
            // console.log('need add item', id)
            this.setState(state => {
                return {
                    ...state,
                    selectedItems: state.selectedItems.concat(id),
                    asyncSettings: state.selectedItems.concat(id),
                    testString: JSON.stringify(state.selectedItems),
                    testString: 'delete2',
                }
            })
            AsyncStorage.removeItem('Settings');
            AsyncStorage.setItem('Settings', JSON.stringify(this.state.selectedItems.concat(id)));
        }
        setTimeout(() => {
            AsyncStorage.getItem('Settings', (err, value) => {
                this.setState(state => {
                    return {
                        ...state,
                        asyncSettings: value
                    }
                })
            })
        }, 3000);
    }
    shouldComponentUpdate(nextProps, nextState){
        if (this.state.selectedItems == nextState.selectedItems){
            return false;
        }
        return true;
    }
    updateTokenSetting(){
        let request = new XMLHttpRequest();
        request.onreadystatechange = (e) => {
            if (request.readyState !== 4) {
              return;
            }
            if (request.status === 200) {
                
            }
        };
        request.open('GET', API_URL + `/set-token?token=${this.state.token}&settings=${JSON.stringify(this.state.selectedItems)}&news_settings=old&version=2`);
        request.send();
        console.log('updateTokenSetting', API_URL + `/set-token?token=${this.state.token}&settings=${JSON.stringify(this.state.selectedItems)}&news_settings=old&version=2`);
    }
    render() {
        // console.log('settings render', this.state);
        this.updateTokenSetting();
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#efefef'}}>
                <View style={styles.container}>
                    <ScrollView>
                    <View style={[listStyles.quoteItem, {marginLeft: 10, marginRight: 10, marginTop: 10}]}>
                        <Text style={{color: "#808080", textAlign: 'center'}}>Выберите интересные Вам источники для получения ежедневной рассылки цитат.</Text>
                    </View>
                    <SectionList
                        style={{paddingLeft: 10, paddingRight: 10, paddingBottom: 5, paddingTop: 5, flex: 0}}
                        stickySectionHeadersEnabled={true}
                        renderItem={({item, index, section}) => (
                            <View key={item.id} style={[listStyles.quoteItem, {marginTop: -5, borderRadius: 0, shadowRadius: 0, flex: 1, flexDirection: 'row', justifyContent: 'space-between'}]}>
                                <View style={{maxWidth: '80%'}}>
                                    <Text style={{fontWeight: 'bold'}}>{item.name ? item.name : item.title}</Text>
                                    <Text>{item.description} {/*item.description.length > 20 ? '...' : '' */}</Text>
                                </View>
                                <Switch value={this.state.selectedItems.includes(item.id) ? true : false}  onValueChange={() => this.switchToggle(item.id)} />
                            </View>
                        )}
                        renderSectionHeader={({section: {title}}) => (
                            <View style={[listStyles.quoteItem, {borderBottomLeftRadius: 0, borderBottomRightRadius: 0}]}>
                                <Text style={listStyles.quoteTitle}>{title}</Text>
                            </View>
                        )}
                        sections={[
                            {title: 'Авторы', data: this.state.authors},
                            {title: 'Книги', data: this.state.books},
                        ]}
                        keyExtractor={(item, index) => item + index}
                    />
                    </ScrollView>
                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
})