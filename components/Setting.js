import React,{ useState, useEffect } from 'react'
import { StyleSheet, Text, View, Button, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput } from 'react-native-gesture-handler';
import {
    SettingsDividerShort,
    SettingsPicker
  } from "react-native-settings-components";
import DialogInput from 'react-native-dialog-input';

export default function Setting(props) {
    const [uri, setUri] = useState();
    const [clientId, setClientId] = useState();
    const [userName, setUserName] = useState();
    const [password, setPassword] = useState();
    const [channels, setChannels] = useState([]);
    
    const [showModal, setShowModal] = useState(false);
    const [savedDataLabel, setSavedDataLabel] = useState([{label: "..",value: null}]);
    const [selectedData, setSelectedData] = useState(null);
    const [savedData, setSavedData] = useState([]);

    useEffect(() => {
        readData();
    }, []);

    var saved = [
        {
            "label": "bukhug",
            "value": "bukhug",
            "uri": "wss://m20.cloudmqtt.com:30831/",
            "clientId": "web1usrn_0901",
            "userName": "iicndnyh",
            "password": "VSKMQ-P6rQrH",
            "channels": ["/A0","/A100"],
        },
    ];
    
    const saveData = async (inputText) => {
        setShowModal(false);
        var tsave = [
            {
                "label": inputText,
                "value": inputText,
                "uri": uri,
                "clientId": clientId,
                "userName": userName,
                "password": password,
                "channels": channels,
            },
        ];
        try {
            await AsyncStorage.setItem("@mqtt_config", JSON.stringify(tsave))
            console.log('Data successfully saved');
            readData();
        } catch (e) {
            console.log('Failed to save the data to the storage');
        }
    }
    const readData = async () => {
        try {
            var savedConfig = await AsyncStorage.getItem("@mqtt_config")
            savedConfig = JSON.parse(savedConfig);
            if (savedConfig !== null) {
                var temp = [...savedDataLabel];
                savedConfig.map(el => {
                    temp.push({label: el.label, value: el.label},);
                })
                setSavedData(savedConfig);
                setSavedDataLabel(temp);
            }
        } catch (e) {
            console.log('Failed to fetch the data from storage');
        }
    }

    function setSaved(value){
        var result = savedData.filter(obj => {
            return obj.label === value
        });
        setUri(result[0].uri);
        setClientId(result[0].clientId);
        setUserName(result[0].userName);
        setPassword(result[0].password);
        setChannels(result[0].channels);
        setSelectedData(value);
    }

    function connect() {
        props.setConf(uri, clientId,userName,password,channels);
    }
    function add() {
        let tempItem = [...channels];
        tempItem.push("");
        setChannels(tempItem);
    }
    function remove() {
        let tempItem = [...channels];
        tempItem.splice(tempItem.length-1, 1);
        setChannels(tempItem);
    }
    function onChangeVal(value, index) {
        let tempItem = [...channels];
        tempItem[index] = value;
        setChannels(tempItem);
    }

    return (
    <ScrollView
      style={{
        flex: 1,
      }}
    >   

    <DialogInput isDialogVisible={showModal}
        title={"Config name"}
        message={"Enter server config name here"}
        hintInput ={"Server 01"}
        submitInput={(inputText) => {saveData(inputText)} }
        closeDialog={() => {setShowModal(false)}}>
    </DialogInput>
      <View style={{ marginTop: 10,marginBottom: 5, marginLeft: 15, display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{color:"#5c5c5c"}}>server config:</Text>
        <TouchableOpacity onPress={() => {setShowModal(true)}} style={{ marginRight:15,fontSize: 10 }}><Text style={{color: "#0014c7"}}>saveconf</Text></TouchableOpacity>
      </View>
      <SettingsPicker
        title="saved config"
        dialogDescription={"Choose"}
        options={savedDataLabel}
        value={selectedData}
        placeholder="choose"
        onValueChange={(value) => setSaved(value)}
        styleModalButtonsText={{ color: "#C70039" }}
      />
      <SettingsDividerShort />
      <View style={styles.row}>
        <Text>Server url</Text>
        <TextInput 
            style={styles.input}
            onChangeText={setUri}
            value={uri}
            placeholder="wss://serverurl:port/"
        />
      </View>
      <SettingsDividerShort />
      <View style={styles.row}>
        <Text>Client id</Text>
        <TextInput 
            style={styles.input}
            onChangeText={setClientId}
            value={clientId}
            placeholder="client_id"
        />
      </View>
      <SettingsDividerShort />
      <View style={styles.row}>
        <Text>Username</Text>
        <TextInput 
            style={styles.input}
            onChangeText={setUserName}
            value={userName}
            placeholder="username"
        />
      </View>
      <SettingsDividerShort />
      <View style={styles.row}>
        <Text>Password</Text>
        <TextInput 
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            placeholder="password"
        />
      </View>
    <View style={{ marginTop: 10,marginBottom: 5, marginLeft: 15 }}>
        <Text style={{color:"#5c5c5c"}}>subscribe channels:</Text>
    </View>
      {channels.map((item,index)=>{
         return (
          <View key={index} style={styles.row}>
            <Text>Channel {index+1}:</Text>
            <TextInput 
                style={styles.input}
                onChangeText={(value) => onChangeVal(value,index)}
                value={item}
                placeholder="name"
            />
          </View>)
      })}
      <View style={{marginTop: 20, alignItems: "center"}}>
        <TouchableOpacity
            onPress={add}
            style={styles.btn}
        >
            <Text style={styles.text}>
                Add
            </Text>
        </TouchableOpacity>
      </View>
      <View style={{marginTop: 20, alignItems: "center"}}>
        <TouchableOpacity
            onPress={remove}
            style={styles.btn}
        >
            <Text style={styles.text}>
                Remove
            </Text>
        </TouchableOpacity>
      </View>
      <View style={{marginTop: 20, alignItems: "center"}}>
        <TouchableOpacity
            onPress={connect}
            style={styles.btn}
        >
            <Text style={styles.text}>
                {props.isConnected == "loading" && "connecting..."}
                {props.isConnected == false && "Connect"}
                {props.isConnected == true && "Disconnect"}
            </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    row:{
        backgroundColor: "#fff",
        padding: 15,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
    },
    btn: {
        alignItems: "center",
        width: "90%",
        backgroundColor: "#dcdcdc",
        padding: 10,
        borderRadius: 5
    },
    text: {
        color: "#000"
    }
});