import { AsyncStorage } from "react-native";
import RNRestart from 'react-native-restart';

export const setLang = lang => {
    console.log('set lang fired', lang);
    AsyncStorage.setItem('lang', lang);
    setTimeout(() => {
        console.log('restart app')
        RNRestart.Restart(); 
    }, 1000);

};

export const setLangInside = lang => {
    return {
        type: 'SET_LANG',
        lang
    }
} 