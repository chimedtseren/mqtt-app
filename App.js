import React,{ useState,useEffect, useRef } from 'react';
import { AppState, StatusBar, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client, Message } from 'react-native-paho-mqtt';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './components/Home';
import Setting from './components/Setting';
import { Ionicons, Octicons } from '@expo/vector-icons';
const Tab = createBottomTabNavigator();

export default function App() {
  const [uri, setUri] = useState(null);
  const [port, setPort] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [password, setPassword] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [channels, setChannels] = useState([]);
  const [streamingValue, setStreamingValue] = useState([]);
  
  const [refresh, setRefresh] = useState(null);

  const [client, setClient] = useState();
  const ref = useRef();
  const appState = useRef(AppState.currentState);

  const myStorage = {
    setItem: (key, item) => {
      myStorage[key] = item;
    },
    getItem: (key) => myStorage[key],
    removeItem: (key) => {
      delete myStorage[key];
    },
  };

  const readLastConfig = async () => {
    return await AsyncStorage.getItem("@mserverlast");
  }

  useEffect(() => {
    readLastConfig()
    .then((lastConf)=>{
      if(lastConf){
        lastConf = JSON.parse(lastConf);
        setConf(lastConf.uri,lastConf.port,lastConf.clientId,lastConf.userName,lastConf.password,lastConf.channels);
      }
    })
    .catch((err)=>{
      console.log('Failed to fetch the data from storage reseting async storage err:' + err);
    });

    AppState.addEventListener('change', _handleAppStateChange);
    return () => {
      AppState.removeEventListener('change', _handleAppStateChange);
    };
  }, []);

  const _handleAppStateChange = nextAppState => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!');
      setRefresh(Math.random);
    }
    appState.current = nextAppState;
    console.log('AppState', appState.current);
  };

  useEffect(() => {
    try {
      if(uri){
        // console.log("URI: "+uri+" URI "+clientId+ " ");
        const sclient = new Client({ uri: "wss://"+uri+":"+port+"/", clientId: clientId, storage: myStorage });
        setClient(sclient);
      }
    } catch (e) {
        setIsConnected(false);
        Alert.alert('Error', "can't connect to server. please check config!", [
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ]);
    }
  },[isConnected]);

  useEffect(() => {
    if(client){
      client.on('connectionLost', (responseObject) => {
        if (responseObject.errorCode !== 0) {
          console.log(responseObject.errorMessage);
        }
      });
      client.on('messageReceived', (message) => {
        var tempchannels = [...channels];
        tempchannels.map((element) => {
          if(element.channel == message.destinationName){
            let val = message.payloadString;
            if(element.type === "switch"){
              if(message.payloadString == "on")
                val = true;
              else if(message.payloadString == "off")
                val = false;
            }
              element.value = val
          }
        });
        setChannels(tempchannels);
      });

      client.connect({
        userName: userName,
        password: password,
        useSSL: true
      })
        .then(() => {
          channels.forEach(element => {
            client.subscribe(element.channel); 
          });
          setIsConnected(true);
          // Alert.alert('Success', "Connection is successful!", [
          //   { text: 'OK', onPress: () => console.log('OK Pressed') },
          // ]);
        })
        .catch((responseObject) => {
          setIsConnected(false);
          Alert.alert('Error', responseObject.message, [
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ]);
          if (responseObject.errorCode !== 0) {
            console.log('onConnectionLost:' + responseObject.errorMessage);
          }
        })
      ;
      
      ref.current = client;
    }
  }, [client]);

  function sendMessage(channel, value, item) {
    let val;
    if(value === true)
      val = "on";
    else if(value === false)
      val = "off";
    else
      val = value;
    console.log("SendMessage channel:"+ channel+" value:"+val);
    const message = new Message(val);
    message.destinationName = channel;
    ref.current.send(message);
    // setChannels([...item]);
  }

  function setConf(uri,port,clientId,userName,password,items) {
    setUri(uri);
    setPort(port);
    setClientId(clientId);
    setUserName(userName);
    setPassword(password);
    setChannels(items);
    setIsConnected("loading");
  }
  
  function disconnect() {
    ref.current.disconnect();
    setIsConnected(false);
    setUri(null);
    setPort(null);
    setClientId(null);
    setUserName(null);
    setPassword(null);
    setChannels([]);
    Alert.alert('Alert', "disconnected", [
      { text: 'OK', onPress: () => console.log('OK Pressed') },
    ]);
  }
  function setChannelsPass(item) {
    setChannels([...item]);
    sendMessage();
  }
  useEffect(() => {
    try {
      if(isConnected){
        setIsConnected("loading");
        const sclient = new Client({ uri: "wss://"+uri+":"+port+"/", clientId: clientId, storage: myStorage });
        setClient(sclient);
      }
    } catch (e) {
        setIsConnected(false);
        Alert.alert('Error', "can't connect to server. please check config!", [
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ]);
    }
  },[refresh]);

  return (
    <NavigationContainer>
      {Platform.OS === 'ios' && <StatusBar barStyle="dark-content"/>}
      <Tab.Navigator>
        <Tab.Screen name="Dashboard" 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Octicons name="dashboard" size={size} color={color} />
            ),
          }}
          children={()=><Home streamingValue={streamingValue} channels={channels} isConnected={isConnected} setChannels={setChannelsPass} sendMessage={sendMessage} setRefresh={setRefresh} />} 
        />
        <Tab.Screen name="Settings"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
          children={()=><Setting isConnected={isConnected} setConf={setConf} disconnect={disconnect} uri={uri} port={port} clientId={clientId} userName={userName} password={password} channels={channels} />} 
         />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
