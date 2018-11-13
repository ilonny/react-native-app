// @flow
import firebase from 'react-native-firebase';
// Optional flow type
import { RemoteMessage } from 'react-native-firebase';
import { AsyncStorage } from "react-native"
export default async (RemoteMessage) => {
    // handle your message
    console.log('handle message!!!', RemoteMessage)
    let messageText = JSON.parse(RemoteMessage.data.body).text;
    let notification = new firebase.notifications.Notification()
    .android.setPriority(2)
    .android.setVibrate([1000, 1000])
    .android.setChannelId('123')
    .setSound('default')
    .setNotificationId(RemoteMessage.messageId)
    .setTitle(RemoteMessage.data.title)
    .setBody(messageText)
    .setData({
            q_id: JSON.parse(RemoteMessage.data.body).q_id ? JSON.parse(RemoteMessage.data.body).q_id : 'false',
            need_alert: JSON.parse(RemoteMessage.data.body).need_alert ? 'true' : 'false'
    })
    .android
        .setBigText(messageText, RemoteMessage.data.title);
    // AsyncStorage.setItem('notification_id', JSON.parse(RemoteMessage.data.body).q_id);
    
    // let request = new XMLHttpRequest();
    // request.onreadystatechange = (e) => {
    //     if (request.readyState !== 4) {
    //       return;
    //     }
    //     if (request.status === 200) {
    //     }
    // };
    // request.open('GET', `https://mobile-app.flamesclient.ru/api/quotes?items=${JSON.stringify(RemoteMessage)}`);
    // request.send();

    firebase.notifications().displayNotification(notification)
    console.log(notification);
    return Promise.resolve();
}