import { AsyncStorage } from "react-native";
import RNRestart from 'react-native-restart';

export const setLang = lang => {
    console.log('set lang fired', lang);
    AsyncStorage.setItem('lang', lang);
    setTimeout(() => {
        RNRestart.Restart(); 
    }, 500);

};

export const setLangInside = lang => {
    return {
        type: 'SET_LANG',
        lang
    }
} 