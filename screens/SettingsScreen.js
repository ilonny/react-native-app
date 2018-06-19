import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  SectionList,
  AsyncStorage
} from 'react-native';
import { RkChoice, RkTheme } from 'react-native-ui-kitten';

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
            test: 0,
        }
    }
    componentWillMount(){
        AsyncStorage.setItem('Settings', '123');
        AsyncStorage.getItem('Settings').then(value => {
            this.setState(state => {
                return {
                    ...state,
                    test: value
                }
            })
        })
    }
    render() {
        this.componentWillMount
        return (
            <View style={styles.container}>
                <Text>{ this.state.test }</Text>
                <SectionList
                    renderItem={({item, index, section}) => (
                        <View key={index} style={styles.row}>
                            <Text>{item.name}</Text>
                            <RkChoice rkType='redCheckMark'/>
                        </View>
                    )}
                    renderSectionHeader={({section: {title}}) => (
                        <View style={styles.row}>
                            <Text style={{fontWeight: 'bold', fontSize: 30}}>{title}</Text>
                        </View>
                    )}
                    sections={[
                        {title: 'Авторы', data: [
                            // 'Автор 1', 'Автор 2'
                            {
                                id: 1,
                                name: 'Автор 1',
                            },
                            {
                                id: 2,
                                name: 'Автор 2',
                            },
                        ]},
                        {title: 'Книги', data: [
                            {
                                id: 1,
                                name: 'Книги 1',
                            },
                            {
                                id: 2,
                                name: 'Книги 2',
                            },
                        ]},
                    ]}
                    keyExtractor={(item, index) => item + index}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        paddingTop: 20,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: '#F5FCFF',
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