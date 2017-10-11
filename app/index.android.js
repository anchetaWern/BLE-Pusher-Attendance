import React, { Component } from 'react';
import {
  AppRegistry,
  Platform,
  PermissionsAndroid,
  StyleSheet,
  Text,
  View,
  NativeEventEmitter,
  NativeModules,
  Button,
  ToastAndroid,
  FlatList,
  Alert
} from 'react-native';

import BleManager from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

import { stringToBytes } from 'convert-string';
import RandomId from 'random-id';
import bytesCounter from 'bytes-counter';
import Pusher from 'pusher-js/react-native';
import Spinner from 'react-native-spinkit';
import Prompt from 'react-native-prompt';

export default class pusherBLEAttendance extends Component {

  constructor() {
    super();
    this.state = {
      is_scanning: false,
      peripherals: null,
      connected_peripheral: null,
      user_id: null,
      attendees: null,
      promptVisible: false,
      has_attended: false
    }

    this.peripherals = [];

    this.startScan = this.startScan.bind(this);
    this.openBox = this.openBox.bind(this);
  }


  componentWillMount() {
    BleManager.enableBluetooth()
      .then(() => {
        console.log('Bluetooth is already enabled');
      })
      .catch((error) => {
        Alert.alert('You need to enable bluetooth to use this app.');
      });
    
    BleManager.start({showAlert: false})
    .then(() => {
      console.log('Module initialized');
    });

    if(Platform.OS === 'android' && Platform.Version >= 23){
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
        if(!result){
          PermissionsAndroid.requestPermission(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
            if(!result){
              Aler.alert('You need to give access to coarse location to use this app.');
            }
          });
        }
      });
    }

  }


  componentDidMount() {
    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', (peripheral) => {
      
      var peripherals = this.peripherals;
      var el = peripherals.filter((el) => {
        return el.id === peripheral.id;
      });

      if(!el.length){
        peripherals.push({
          id: peripheral.id,
          name: peripheral.name
        });

        this.peripherals = peripherals;
      }
    });

    bleManagerEmitter.addListener(
      'BleManagerStopScan',
      () => {
        console.log('scan stopped');
        if(this.peripherals.length == 0){
          Alert.alert('Nothing found', "Sorry, no peripherals we're found");
        }
        this.setState({
          is_scanning: false,
          peripherals: this.peripherals
        });  
      }
    );

    var pusher = new Pusher('YOUR PUSHER APP KEY', {
      cluster: 'YOUR PUSHER APP CLUSTER',
      encrypted: true
    });

    var channel = pusher.subscribe('attendance-channel');
    channel.bind('attendance-event', (data) => {
      if(data.is_attendees){
        this.setState({
          attendees: data.attendees
        });
      }else{
        ToastAndroid.show(`${data.full_name} just entered the room!`, ToastAndroid.LONG);
        this.setState({
          attendees: [...this.state.attendees, data]
        });
      }

    });
  }


  startScan() {
    this.peripherals = [];
    this.setState({
      is_scanning: true
    });

    BleManager.scan([], 2, true)
    .then(() => { 
      console.log('scan started');
    });

  }


  connect(peripheral_id) {
    BleManager.connect(peripheral_id)
      .then(() => {
        this.setState({
          connected_peripheral: peripheral_id
        });

        Alert.alert('Connected!', 'You are now connected to the peripheral.');

        BleManager.retrieveServices(peripheral_id)
          .then((peripheralInfo) => {
            console.log('Peripheral info:', peripheralInfo);
          }
        ); 
      })
      .catch((error) => {
        Alert.alert("Err..", 'Something went wrong while trying to connect.');
      });

  }


  attend(value) {
   
    let user_id = RandomId(15);

    this.setState({
      user_id: user_id
    });

    let me = {
      id: user_id,
      full_name: value
    }; 

    let str = JSON.stringify(me);
    let bytes = bytesCounter.count(str);
    let data = stringToBytes(str);

    const BASE_UUID = '-5659-402b-aeb3-d2f7dcd1b999';
    const PERIPHERAL_ID = '0000';
    const PRIMARY_SERVICE_ID = '0100';

    let primary_service_uuid = PERIPHERAL_ID + PRIMARY_SERVICE_ID + BASE_UUID; 
    let ps_characteristic_uuid = PERIPHERAL_ID + '0300' + BASE_UUID; 

    BleManager.write(this.state.connected_peripheral, primary_service_uuid, ps_characteristic_uuid, data, bytes)
      .then(() => {

        this.setState({
          has_attended: true
        });

        BleManager.disconnect(this.state.connected_peripheral)
          .then(() => {
            Alert.alert('Attended', 'You have successfully attended the event, please disable bluetooth.');
          })
          .catch((error) => {
            Alert.alert('Error disconnecting', "You have successfully attended the event but there's a problem disconnecting to the peripheral, please disable bluetooth to force disconnection.");
          });

      })
      .catch((error) => {
        Alert.alert('Error attending', "Something went wrong while trying to attend. Please try again.");
      });
  }


  renderItem({item}) {

    if(item.full_name){
      return (
        <View style={styles.list_item} key={item.id}>
          <Text style={styles.list_item_text}>{item.full_name}</Text>
          <Text style={styles.list_item_text}>{item.time_entered}</Text>
        </View>
      );
    }

    return (
      <View style={styles.list_item} key={item.id}>
        <Text style={styles.list_item_text}>{item.name}</Text>
        <Button 
          title="Connect" 
          color="#1491ee" 
          style={styles.list_item_button} 
          onPress={this.connect.bind(this, item.id)} />
      </View>
    );
  }


  openBox() {
    this.setState({
      promptVisible: true
    });
  }


  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.app_title}>
            <Text style={styles.header_text}>BLE-Pusher Attendance</Text>   
          </View>
          <View style={styles.header_button_container}>
            {
              !this.state.connected_peripheral &&
              <Button 
                title="Scan" 
                color="#1491ee" 
                onPress={this.startScan} />
            }
          </View>
        </View>
        
        <View style={styles.body}>
        
          <Spinner 
            size={50} 
            type={"WanderingCubes"} 
            color={"#6097FC"} 
            isVisible={this.state.is_scanning} 
            style={styles.spinner}
          />
          
          {
            !this.state.connected_peripheral &&
            <FlatList
              data={this.state.peripherals}
              renderItem={this.renderItem.bind(this)}
            />
          }

          {
            this.state.attendees &&
            <View style={styles.attendees_container}>
              <Prompt
                  title="Enter your full name"
                  placeholder="e.g. Son Goku"
                  visible={this.state.promptVisible}
                  onCancel={() => {
                    this.setState({
                      promptVisible: false
                    });
                  } 
                  }
                  onSubmit={ (value) => {
                    this.setState({
                      promptVisible: false
                    });
                    this.attend.call(this, value);
                  }
                  }/>
              {
                !this.state.has_attended && 
                <Button 
                  title="Enter" 
                  color="#1491ee" 
                  onPress={this.openBox} />
              }
              <FlatList
                data={this.state.attendees}
                renderItem={this.renderItem.bind(this)}
              />
            </View>
          }

        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  header: {
    flex: 1,
    backgroundColor: '#3B3738',
    flexDirection: 'row'
  },
  app_title: {
    flex: 7,
    padding: 10
  },
  header_button_container: {
    flex: 2,
    justifyContent: 'center',
    paddingRight: 5
  },  
  header_text: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold'
  },
  body: {
    flex: 19
  },
  list_item: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 15,
    paddingBottom: 15,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flex: 1,
    flexDirection: 'row'
  },
  list_item_text: {
    flex: 8,
    color: '#575757',
    fontSize: 18
  },
  list_item_button: {
    flex: 2
  },
  spinner: {
    alignSelf: 'center',
    marginTop: 30
  },
  attendees_container: {
    flex: 1
  }
});

AppRegistry.registerComponent('pusherBLEAttendance', () => pusherBLEAttendance);
