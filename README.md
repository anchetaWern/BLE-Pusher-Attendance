# Attendance app with React Native and BLE
An attendance app built with React Native, Pusher, and BLE. You can view the tutorial at the Pusher tutorial hub: [Creating a realtime attendance app with React Native, BLE and Pusher](https://pusher.com/tutorials/realtime-attendance-react-native-ble)

*Note: the React Native code in this repo may be a little bit outdated and won't run immediately after you've followed the setup instructions. Be sure to refactor the code to use the more recent React Native syntax if it doesn't run for you.*

## Prerequisites

- BLE peripheral device - I used a Raspberry Pi 3 in this tutorial, but you can also use any micro-controller with BLE support.
- BLE central device - any smartphone with bluetooth capabilities can act as a central device.
- Knowledge of React Native
- Knowledge of Git and GitHub
- [Pusher Account](https://pusher.com/) and a Pusher app

## Getting Started

1. Create a new React Native app:

```
react-native init BLEPusherAttendance
```

2. Clone the repo:

```
git clone https://github.com/anchetaWern/BLE-Pusher-Attendance.git
```

3. Navigate inside the `app` directory and copy the `package.json` file to the new React Native project you just created.

4. Still inside the `app` directory, copy the contents of `index.android.js` and paste it on the `index.js` file of your React Native project.

5. Navigate inside your project folder and install the dependencies:

```
cd BLEPusherAttendance
npm install
```

6. Navigate inside the repo you cloned earlier and go inside the `server` directory:

```
cd BLE-Pusher-Attendance
cd server
```

7. Create a new `.env` file and replace the placeholder values with your Pusher app credentials:

```
APP_ID="YOUR PUSHER APP ID"
APP_KEY="YOUR PUSHER APP KEY"
APP_SECRET="YOUR PUSHER APP SECRET"
APP_CLUSTER="YOUR PUSHER APP CLUSTER" 
```

8. Still inside the `server` directory, open a new terminal window and execute `node attendance.js` to launch the server.

9. Navigate inside your new React Native project and open the `index.js` file on your text editor:

```
cd BLEPusherAttendance
nano index.js
```

10. Replace the placeholder values on lines 110 and 111 with your Pusher app credentials: https://github.com/anchetaWern/BLE-Pusher-Attendance/blob/master/app/index.android.js#L110-L111

11. Run the app on your device (emulator wouldn't work because there's no bluetooth in there):

```
react-native run-android
```

## Built With

- [React Native](http://facebook.github.io/react-native/)
- [Pusher Channels](https://pusher.com/)
- [Bleno](https://github.com/noble/bleno)
- [React Native BLE Manager](https://github.com/innoveit/react-native-ble-manager)
- [Bytes counter](https://github.com/bolshchikov/bytes-counter)
- [Convert string](https://www.npmjs.com/package/convert-string)

## Donation

If this project helped you reduce time to develop, please consider buying me a cup of coffee :)

<a href="https://www.buymeacoffee.com/wernancheta" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
