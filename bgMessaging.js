// @flow
import firebase from 'react-native-firebase';
// Optional flow type
import { RemoteMessage } from 'react-native-firebase';

export default async (RemoteMessage) => {
    // handle your message
    console.log('handle message!!!', RemoteMessage)
    let notification = new firebase.notifications.Notification()
    .android.setChannelId('123')
    .setNotificationId(RemoteMessage.messageId)
    .setTitle(RemoteMessage.data.title)
    .setBody(RemoteMessage.data.body);
    firebase.notifications().displayNotification(notification)
    console.log(notification);
    return Promise.resolve();
}