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
      let device_settings;
      let device_settings_site;
      AsyncStorage.getItem('Settings', (err, value) => {
        if (value){
          device_settings = value;
        } else {
          device_settings = 'all';
        }
        AsyncStorage.getItem('SiteSettings', (err, value2) => {
          if (value2){
            device_settings_site = value2;
          } else {
            device_settings_site = JSON.stringify(['content', 'read', 'look', 'listen', 'important']);
          }
            console.log( 'TOKEN13:', fcmToken );
            AsyncStorage.setItem('Token', JSON.stringify(fcmToken));
            let request = new XMLHttpRequest();
            request.onreadystatechange = (e) => {
              if (request.readyState !== 4) {
                return;
              }
              if (request.status === 200) {
                  
              }
            };
            request.open('GET', API_URL + `/set-token?token=${JSON.stringify(fcmToken)}&settings=${device_settings}&news_settings=${device_settings_site}&version=2`);
            request.send();
            console.log(API_URL + `/set-token?token=${JSON.stringify(fcmToken)}&settings=${device_settings}&news_settings=${device_settings_site}&version=2`);
        });
      });
    } else {
      console.log('nooo((((((( token is' + fcmToken)
      // user doesn't have a device token yet
    } 
});
firebase.messaging().onTokenRefresh(fcmToken => {
  if (fcmToken) {
    let device_settings;
    let device_settings_site;
    AsyncStorage.getItem('Settings', (err, value) => {
      if (value){
        device_settings = value;
      } else {
        device_settings = 'all';
      }
      AsyncStorage.getItem('SiteSettings', (err, value2) => {
        if (value2){
          device_settings_site = value2;
        } else {
          device_settings_site = JSON.stringify(['content', 'read', 'look', 'listen', 'important']);
        }
        
          console.log( 'TOKEN123:', fcmToken );
          AsyncStorage.setItem('Token', JSON.stringify(fcmToken));
          let request = new XMLHttpRequest();
          request.onreadystatechange = (e) => {
            if (request.readyState !== 4) {
              return;
            }
            if (request.status === 200) {
                
            }
          };
          request.open('GET', API_URL + `/set-token?token=${JSON.stringify(fcmToken)}&settings=${device_settings}&news_settings=${device_settings_site}&version=2`);
          request.send();
          console.log('device_settings_site', device_settings_site);
          console.log(API_URL + `/set-token?token=${JSON.stringify(fcmToken)}&settings=${device_settings}&news_settings=${device_settings_site}&version=2`);
      });
    });
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
  } else if (notificationOpen.notification._data.news_id != 'false'){
    let n_id = notificationOpen.notification._data.news_id;
    let n_t = notificationOpen.notification._data.news_title;
    NavigationService.navigate('SiteDetail', {id: n_id, title: n_t,});
    AsyncStorage.setItem('redirect', JSON.stringify({
      screen: 'SiteDetail',
      data: {id: n_id, title: n_t}
    }));
  }
});

firebase.notifications().getInitialNotification()
.then((notificationOpen) => {
  console.log('notif OFFLINE OPENED', notificationOpen);
  if (notificationOpen.notification._data.need_alert == 'true'){
    Alert.alert("", notificationOpen.notification._body);
  } else if (notificationOpen.notification._data.q_id != 'false'){
    let q_id = notificationOpen.notification._data.q_id;
    NavigationService.navigate('Details', {quote_id: q_id});
  } else if (notificationOpen.notification._data.news_id != 'false'){
    let n_id = notificationOpen.notification._data.news_id;
    let n_t = notificationOpen.notification._data.news_title;
    NavigationService.navigate('SiteDetail', {id: n_id, title: n_t,});
    AsyncStorage.setItem('redirect', JSON.stringify({
      screen: 'SiteDetail',
      data: {id: n_id, title: n_t}
    }));
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