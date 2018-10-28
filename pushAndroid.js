import {
    AsyncStorage,
    Alert
  } from 'react-native';
import { API_URL } from './constants/api';
import firebase from 'react-native-firebase';

import NavigationService from './NavigationService'

console.log('push-android is required')
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
firebase.messaging().onTokenRefresh(fcmToken => {
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

firebase.notifications().onNotificationOpened((notificationOpen) => {
  console.log('ONNOTIFICATION OPENED', notificationOpen.notification)
  if (notificationOpen.notification._data.need_alert == 'true'){
      Alert.alert("", notificationOpen.notification._body);
  } else if (notificationOpen.notification._data.q_id != 'false'){
    let q_id = notificationOpen.notification._data.q_id;
    NavigationService.navigate('Details', {quote_id: q_id});
  }
});
// setTimeout(() => {
//     console.log('showed??');
//     let notification = new firebase.notifications.Notification()
//     .setNotificationId(Date.now())
//     .setTitle('test?')
//     .setBody('body?');
//     firebase.notifications().displayNotification(notification)
// }, 3000);