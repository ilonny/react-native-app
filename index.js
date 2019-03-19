import { AppRegistry } from 'react-native';
import { YellowBox } from 'react-native';
import bgMessaging from './bgMessaging';
YellowBox.ignoreWarnings([
    'Warning: isMounted(...) is deprecated',
    'Module RCTImageLoader',
    'Class RCTCxxModule',
    'Remote debugger',
    'RCTBridge required dispatch_sycn to load'
]);
// import App from './App';
import AppLR from './AppLR'
// AppRegistry.registerComponent('GuruOnline', () => App);
AppRegistry.registerComponent('GuruOnline', () => AppLR);
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging);