import { AppRegistry } from 'react-native';
import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings([
    'Warning: isMounted(...) is deprecated',
    'Module RCTImageLoader',
    'Class RCTCxxModule',
    'Remote debugger',
    'RCTBridge required dispatch_sync to load',
    'Module RNFetchBlob requires main queue',
    'required dispatch_sync to load',
    'Required dispatch'
]);
import App from './App';
AppRegistry.registerComponent('GuruOnline', () => App);
