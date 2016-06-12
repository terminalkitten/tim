'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
var ShowPropertiesView = require('./ShowPropertiesView');
var PhotoView = require('./PhotoView');
var PhotoList = require('./PhotoList');
// var AddNewIdentity = require('./AddNewIdentity');
// var SwitchIdentity = require('./SwitchIdentity');
var ShowRefList = require('./ShowRefList');
// var IdentitiesList = require('./IdentitiesList');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');
var Store = require('../Store/Store');
var reactMixin = require('react-mixin');
var ResourceMixin = require('./ResourceMixin');
var QRCode = require('./QRCode')
var buttonStyles = require('../styles/buttonStyles');
const TOUCH_ID_IMG = require('../img/touchid2.png')
const TALK_TO_EMPLOYEE = '1'
// const SERVER_URL = 'http://192.168.0.162:44444/'

var extend = require('extend');
var constants = require('@tradle/constants');

import {
  StyleSheet,
  ScrollView,
  Image,
  View,
  Text,
  TextInput,
  TouchableHighlight,
} from 'react-native'

import React, { Component } from 'react'

class ResourceView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resource: props.resource,
      embedHeight: {height: 0},
      isLoading: props.resource.id ? true : false
    };
  }
  componentWillMount() {
    if (this.props.resource.id)
      Actions.getItem(this.props.resource)
  }
  componentDidMount() {
    this.listenTo(Store, 'handleEvent');
  }
  handleEvent(params) {
    if (params.action === 'showIdentityList')
      this.onShowIdentityList(params);
    else if (params.action == 'getItem') {
      this.setState({
        resource: params.resource,
        isLoading: false
      })
    }
      // this.showRefResource(params.resource)
    else  if (params.resource)
      this.onResourceUpdate(params);
  }
  onResourceUpdate(params) {
    var resource = params.resource;
    // if (resource  &&  this.props.resource[constants.ROOT_HASH] === resource[constants.ROOT_HASH]) {
    //   var me = utils.getMe();
    //   if (resource[constants.ROOT_HASH] === me[constants.ROOT_HASH])
    //     utils.setMe(resource);
      this.setState({resource: resource});
    // }
  }
  changePhoto(photo) {
    this.setState({currentPhoto: photo});
  }
  onShowIdentityList(params) {
    var me = utils.getMe();
    this.props.navigator.push({
      id: 8,
      title: 'My Identities',
      component: IdentitiesList,
      backButtonTitle: 'Profile',
      passProps: {
        filter: '',
        list: params.list
      }
    });
  }

  render() {
    if (this.state.isLoading)
      return <View/>
    var resource = this.state.resource;
    var modelName = resource[constants.TYPE];
    var model = utils.getModel(modelName).value;
    var photos = [];
    if (resource.photos  &&  resource.photos.length > 1) {
      extend(photos, resource.photos);
      photos.splice(0, 1);
    }
    var actionPanel;
    var isIdentity = model.id === constants.TYPES.PROFILE;
    var isOrg = model.id === constants.TYPES.ORGANIZATION;
    var me = utils.getMe()
    var isMe = isIdentity ? resource[constants.ROOT_HASH] === me[constants.ROOT_HASH] : true;
    if ((isIdentity  &&  !isMe) || (isOrg  &&  (!me.organization  ||  utils.getId(me.organization) !== utils.getId(resource))))
    // if (isIdentity  &&  !isMe)
      actionPanel = <View/>
    else
      actionPanel = <ShowRefList resource={resource} currency={this.props.currency} navigator={this.props.navigator} />
    var qrcode
    if (isMe && me.organization && me.organization.url)
      qrcode = <View>
                 <QRCode inline={true} content={TALK_TO_EMPLOYEE + ';' + me.organization.url + ';' + utils.getId(me.organization).split('_')[1] + ';' + me[constants.ROOT_HASH]} dimension={370} />
               </View>
    else
      qrcode = <View />
    // var switchTouchId = isIdentity
    //                   ? <TouchableHighlight style={{backgroundColor: '#eeeeee'}} underlayColor='transparent' onPress={() => {
    //                       let r = {
    //                         _r: me[constants.ROOT_HASH],
    //                         _t: constants.TYPES.PROFILE,
    //                         useTouchId: !me.useTouchId
    //                       }

    //                       Actions.addItem({resource: me, value: r, meta: utils.getModel(constants.TYPES.PROFILE).value})
    //                    }}>
    //                      <View style={{flexDirection: 'row'}}>
    //                         <Image source={{TOUCH_ID_IMG}} style={{color: 'red', width: 50, height: 50}} />
    //                         <Text style={{color: '#2E3B4E', fontSize: 20, paddingVertical: 10, alignSelf: 'center'}}>{me.useTouchId ? translate('switchTouchIdOff') : translate('switchTouchIdOn')} </Text>
    //                       </View>
    //                     </TouchableHighlight>
    //                  : <View />
    var switchTouchId = <View />
          // <AddNewIdentity resource={resource} navigator={this.props.navigator} />
          // <SwitchIdentity resource={resource} navigator={this.props.navigator} />
    return (
      <ScrollView  ref='this' style={styles.container}>
        <View style={[styles.photoBG]}>
          <PhotoView resource={resource} navigator={this.props.navigator}/>
        </View>
        {actionPanel}
        {qrcode}
        <PhotoList photos={photos} resource={this.props.resource} navigator={this.props.navigator} isView={true} numberInRow={photos.length > 4 ? 5 : photos.length} />
        <ShowPropertiesView resource={resource}
                            showItems={this.showResources.bind(this)}
                            showRefResource={this.getRefResource.bind(this)}
                            currency={this.props.currency}
                            excludedProperties={['photos']}
                            navigator={this.props.navigator} />
        {switchTouchId}
      </ScrollView>
    );
  }

  getRefResource(resource, prop) {
    var model = utils.getModel(this.props.resource[constants.TYPE]).value;

    this.state.prop = prop;
    this.state.propValue = utils.getId(resource.id);
    Actions.getItem(resource.id);
  }

}
reactMixin(ResourceView.prototype, Reflux.ListenerMixin);
reactMixin(ResourceView.prototype, ResourceMixin);

var styles = StyleSheet.create({
  container: {
    marginTop: 64,
    flex: 1,
  },
  photoBG: {
    backgroundColor: '#245D8C',
    alignItems: 'center',
  },
  // footer: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   backgroundColor: '#eeeeee',
  //   borderBottomColor: '#eeeeee',
  //   borderRightColor: '#eeeeee',
  //   borderLeftColor: '#eeeeee',
  //   borderWidth: 1,
  //   borderTopColor: '#cccccc',
  //   height: 35,
  //   paddingVertical: 5,
  //   paddingHorizontal: 10,
  //   alignSelf: 'stretch'
  // }

});

module.exports = ResourceView;
