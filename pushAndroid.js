import {
    Platform,
    StyleSheet,
    Text,
    View,
    AsyncStorage,
    PushNotificationIOS
  } from 'react-native';
import { API_URL } from './constants/api';
import firebase from 'react-native-firebase';
firebase.messaging().getToken()
  .then(fcmToken => {
    if (fcmToken) {
      // user has a device token
      console.log('yesssss token is' + fcmToken)
      AsyncStorage.setItem('Token', JSON.stringify(fcmToken));
      let request = new XMLHttpRequest();
        request.onreadystatechange = (e) => {
            if (request.readyState !== 4) {
              return;
            }
            if (request.status === 200) {
                
            }
        };
        request.open('GET', API_URL + `/set-token?token=${JSON.stringify(fcmToken)}&settings=all`);
        request.send();
        console.log(API_URL + `/set-token?token=${JSON.stringify(fcmToken)}&settings=all`);
    } else {
      console.log('nooo((((((( token is' + fcmToken)
      // user doesn't have a device token yet
    } 
});

firebase.messaging().hasPermission()
  .then(enabled => {
    if (enabled) {
        console.log('USER HAS PERMISSIONS');
    } else {
        console.log('USER NO PERMISSIONS');
    } 
  });


  firebase.messaging().requestPermission()
  .then(() => {
      console.log("User has authorised");  
  })
  .catch(error => {
    console.log("User has rejected permissions");  
  });

firebase.messaging().onMessage((message) => {
    // Process your message as required
    console.log('MESSAGE IS', message);
});

// setTimeout(() => {
//     console.log('showed??');
//     let notification = new firebase.notifications.Notification()
//     .setNotificationId(Date.now())
//     .setTitle('test?')
//     .setBody('body?');
//     firebase.notifications().displayNotification(notification)
// }, 3000);