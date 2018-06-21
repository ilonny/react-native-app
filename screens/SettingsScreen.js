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
import { RkChoice, RkTheme } from 'react-native-ui-kitten';
import { getItemsFromApiAsync } from './actions/getAsyncItems'
import { API_URL } from '../constants/api';
// import { API_URL } from '../constants/api'

RkTheme.setType('RkChoice', 'redCheckMarkSelected', {
    backgroundColor: 'transparent',
    inner: {
      tintColor: 'red',
    }
});

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
        };
        // this.switchToggle(id) = this.switchToggle(id).bind(this)
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
                    }
                });
                //проверим если до этого ничего не было выбрано то выберем все и сохраним и в стейт, и в сторедж
                //TODO добавить проверку чтобы хотя бы один был подключен.
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
                                testString: 'test2',
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
                        test: request.responseText
                    }
                });
            }
        };
        request.open('GET', API_URL + '/items');
        request.send();

    }
    switchToggle(id){
        if (this.state.selectedItems.includes(id)){
            let arr = [...this.state.selectedItems];
            let index = arr.indexOf(id);
            arr.splice(index, 1);
            this.setState(state => {
                return {
                    ...state,
                    selectedItems: arr
                }
            })
        } else {
            this.setState(state => {
                return {
                    ...state,
                    selectedItems: state.selectedItems.concat(id),
                    testString: JSON.stringify(state.selectedItems)
                }
            })
        }
        AsyncStorage.removeItem('Settings');
        AsyncStorage.setItem('Settings', JSON.stringify(this.state.selectedItems));
        this.setState(state => {
            return {
                ...state,
                asyncSettings: this.state.selectedItems,
            }
        })
    }
    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#F5FCFF'}}>
                <View style={styles.container}>
                    <ScrollView>
                    <Text>{ JSON.stringify(this.state.selectedItems) }</Text>
                    <Text>{ this.state.testString } {/* Date.now() */ } </Text>
                    <Text>{ JSON.stringify(this.state.asyncSettings) }</Text>
                    <SectionList
                        renderItem={({item, index, section}) => (
                            <View key={item.id} style={styles.row}>
                                <Text>{item.name ? item.name : item.title}</Text>
                                <Switch value={this.state.selectedItems.includes(item.id) ? true : false}  onValueChange={() => this.switchToggle(item.id)} />
                            </View>
                        )}
                        renderSectionHeader={({section: {title}}) => (
                            <View style={styles.row}>
                                <Text style={{fontWeight: 'bold', fontSize: 30}}>{title}</Text>
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
    container: {
        padding: 10,
        // paddingTop: 20,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',  
    },
    row: {
        marginBottom: 5,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fafafa',
    }
})