import React,{ useState,useEffect, useRef } from 'react';
import { StatusBar, Alert } from 'react-native';
import { Client, Message } from 'react-native-paho-mqtt';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './components/Home';
import Setting from './components/Setting';
import Publish from './components/Publish';
import { Ionicons, Octicons, MaterialIcons } from '@expo/vector-icons';
const Tab = createBottomTabNavigator();

export default function App() {
  const [powerValue, setPowerValue] = useState(["0","0","0","0","0","0","0","0"]);
  const [uri, setUri] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [password, setPassword] = useState(null);

  const [isConnected, setIsConnected] = useState(false);
  const [channels, setChannels] = useState([]);

  const [client, setClient] = useState();
  const ref = useRef();

  const myStorage = {
    setItem: (key, item) => {
      myStorage[key] = item;
    },
    getItem: (key) => myStorage[key],
    removeItem: (key) => {
      delete myStorage[key];
    },
  };

  function round(value, decimals) {
		return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
	}

  function subscribe_log(b01_len, b02_len) { //web interface log function
    console.log("B01_length: " + b01_len + "   B02_length: " + b02_len);
		var B03 = ""; // string variable
		var B04 = []; // modbus array variable
		var k,k1;
		for(k=1; k < b01_len; k++) {
			B03 += B01[k];
		};
		B03 += ",";
		for(k1=1; k1 < b02_len; k1++) {
			B03 += B02[k1];
		};
		B04 = B03.split(",");
    
    var hours = new Date().getHours();
    var min = new Date().getMinutes();
    var sec = new Date().getSeconds();

    var bars = [
      round(B04[2],2) + " MW",
      round(B04[5],2) + " MWh",
      round(B04[6],2) + " MW",
      round(B04[7],2) + " W/m2",
      round(B04[8],2),
      round(B04[11],2),
      round(B04[43],2) + " °C",
      hours + ":" + min + ":" + sec
    ];
    setPowerValue(bars);
	}

  useEffect(() => {
    if(uri){
      setIsConnected("loading");
      console.log("URI: "+uri+" URI "+clientId+ " ");
      const sclient = new Client({ uri: uri, clientId: clientId, storage: myStorage });
      setClient(sclient);
    }
  },[uri,clientId,userName,password,channels]);

  useEffect(() => {
    if(client){
      client.on('connectionLost', (responseObject) => {
        if (responseObject.errorCode !== 0) {
          console.log(responseObject.errorMessage);
        }
      });
      var b01_len,b02_len;
      client.on('messageReceived', (message) => {
        switch(message.destinationName){
          case "/A0":
            B01 = message.payloadString;
            b01_len = B01.length-1;
            break;
          case "/A100":
            B02 = message.payloadString;
            b02_len = B02.length-1;
            break;
        }
        subscribe_log(b01_len,b02_len);
      });

      client.connect({
        userName: userName,
        password: password,
        useSSL: true
      })
        .then(() => {
          channels.forEach(element => {
            client.subscribe(element); 
          });
          setIsConnected(true);
          Alert.alert('Success', "Connection is successful!", [
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ]);
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

  function sendMessage(channel ,value) {
    console.log("SendMessage channel:"+ channel+" value:"+value);
    const message = new Message(value);
    message.destinationName = channel;
    ref.current.send(message);
  }

  function setConf(uri,clientId,userName,password,items) {
    setUri(uri);
    setClientId(clientId);
    setUserName(userName);
    setPassword(password);
    setChannels(items);
  }
  
  function disconnect() {
    ref.current.disconnect();
    setIsConnected(false);
    setUri(null);
    setClientId(null);
    setUserName(null);
    setPassword(null);
    setChannels([]);
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content"/>
      <Tab.Navigator>
        <Tab.Screen name="Dashboard" 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Octicons name="dashboard" size={size} color={color} />
            ),
          }}
          children={()=><Home powerValue={powerValue} isConnected={isConnected} />} 
        />
        <Tab.Screen name="Publish" 
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="publish" size={size} color={color} />
            ),
          }}
          children={()=><Publish channels={channels} sendMessage={sendMessage} />} 
        />
        <Tab.Screen name="Settings"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
          children={()=><Setting isConnected={isConnected} setConf={setConf} disconnect={disconnect} uri={uri} clientId={clientId} userName={userName} password={password} />} 
         />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
