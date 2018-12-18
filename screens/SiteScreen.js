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
  TouchableOpacity
} from 'react-native';
export default class SiteScreen extends Component {
    static navigationOption = ({navigation}) => {
        return {
            tabBar: {
                label: '123',
                title: '3454',
            },
            tapBarLabel: '1234',
        }
    }
    state = {
        test: 123,
    }
    render(){
        return (
            <View>
                <Text>{this.state.test}</Text>
            </View>
        )
    }
}