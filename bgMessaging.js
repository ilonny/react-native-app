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
    .android.setPriority(firebase.notifications.Android.Priority.High)
    .android.setVibrate([1000, 1000])
    .android.setChannelId('123')
    .setSound('default')
    .setNotificationId(RemoteMessage.messageId)
    .setTitle(RemoteMessage.data.title)
    .setBody(messageText)
    .setData({
            q_id: JSON.parse(RemoteMessage.data.body).q_id ? JSON.parse(RemoteMessage.data.body).q_id : 'false',
            need_alert: JSON.parse(RemoteMessage.data.body).need_alert ? 'true' : 'false',
            news_id: JSON.parse(RemoteMessage.data.body).news_id ? JSON.parse(RemoteMessage.data.body).news_id : 'false',
            news_title: JSON.parse(RemoteMessage.data.body).news_title ? JSON.parse(RemoteMessage.data.body).news_title : 'false',
            c_date: JSON.parse(RemoteMessage.data.body).c_date ? JSON.parse(RemoteMessage.data.body).c_date : 'false',
    })
    .android
        .setBigText(messageText, RemoteMessage.data.title);
    if (JSON.parse(RemoteMessage.data.body).news_id){
        
        AsyncStorage.setItem('redirect', JSON.stringify({
            screen: 'SiteDetail',
            data: {
                id: JSON.parse(RemoteMessage.data.body).news_id,
                title: JSON.parse(RemoteMessage.data.body).news_title,
                c_date: JSON.parse(RemoteMessage.data.body).c_date,
            }
        }));
    }
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
    const channelId = new firebase.notifications.Android.Channel('123', '123', firebase.notifications.Android.Importance.Max);
    // Create the channel
    firebase.notifications().android.createChannel(channelId);
    firebase.notifications().displayNotification(notification)
    console.log(notification);
    return Promise.resolve();
}