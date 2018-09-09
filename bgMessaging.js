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
    .android.setChannelId('123')
    .setSound('default')
    .android.setVibrate([1000])
    .setNotificationId(RemoteMessage.messageId)
    .setTitle(RemoteMessage.data.title)
    .setBody(messageText)
    .setData({
            q_id: JSON.parse(RemoteMessage.data.body).q_id
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