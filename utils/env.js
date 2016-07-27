
import {
  Platform
} from 'react-native'

module.exports = {
  GCM_SENDER_ID: '1069381032456',
  serviceID: 'tradle',
  LOCAL_IP: __DEV__ && require('./localIP'),
  isAndroid: function () {
    return Platform.OS === 'android'
  },
  isIOS: function () {
    return Platform.OS === 'ios'
  }
}
