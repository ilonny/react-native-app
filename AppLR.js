import React, { Component } from "react";
import {AsyncStorage, View, ActivityIndicator } from "react-native";
import App from "./App";
import AppEng from "./AppEng";

export default class AppLR extends Component {
    constructor(props){
        super(props);
        this.state = {
            comp: (<View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator></ActivityIndicator></View>  )
        }
    }
    componentDidMount() {
        AsyncStorage.getItem("lang", (err, value) => {
            console.log('lang is ', value)
            if (!value || value == "ru") {
                console.log('return App comp')
                // comp = App;
                this.setState({
                    comp: <App lang='ru'/>
                })
            } else {
                console.log('return AppEng comp')
                this.setState({
                    comp: <AppEng lang='eng'/>
                })
            }
        });
    }
    render() {
        return this.state.comp
    }
}
