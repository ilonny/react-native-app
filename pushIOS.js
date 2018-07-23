import {
    Platform,
    StyleSheet,
    Text,
    View,
    AsyncStorage,
    PushNotificationIOS
  } from 'react-native';
  import { API_URL } from './constants/api';

var PushNotification = require('react-native-push-notification');
    PushNotification.configure({

      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function(token) {
          console.log( 'TOKEN:', token );
          AsyncStorage.setItem('Token', JSON.stringify(token));
          let request = new XMLHttpRequest();
            request.onreadystatechange = (e) => {
                if (request.readyState !== 4) {
                  return;
                }
                if (request.status === 200) {
                    
                }
            };
            request.open('GET', API_URL + `/set-token?token=${JSON.stringify(token)}&settings=all`);
            request.send();
            console.log(API_URL + `/set-token?token=${JSON.stringify(token)}&settings=all`);
      },

      // (required) Called when a remote or local notification is opened or received
      onNotification: function(notification) {
          console.log( 'NOTIFICATION:', notification );
          request.open('GET', API_URL + `/set-token?token=${JSON.stringify(notification)}&settings=debug_notifications`);
          request.send();
          // process the notification
          // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
          notification.finish(PushNotificationIOS.FetchResult.NoData);
      },

      // ANDROID ONLY: GCM Sender ID (optional - not required for local notifications, but is need to receive remote push notifications)
      senderID: "655925451031",

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
          alert: true,
          badge: true,
          sound: true
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
        * (optional) default: true
        * - Specified if permissions (ios) and token (android and ios) will requested or not,
        * - if not, you must call PushNotificationsHandler.requestPermissions() later
        */
      requestPermissions: true,
    })