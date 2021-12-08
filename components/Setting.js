import React,{ useState, useEffect } from 'react'
import { StyleSheet, Text, View, Alert, ScrollView, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput } from 'react-native-gesture-handler';
import { SettingsDividerShort, SettingsPicker } from "react-native-settings-components";
import { Feather, AntDesign, MaterialIcons, Entypo } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';

export default function Setting(props) {
    const [uri, setUri] = useState();
    const [clientId, setClientId] = useState();
    const [userName, setUserName] = useState();
    const [password, setPassword] = useState();
    const [channels, setChannels] = useState([]);
    const [visiblePassword, setVisiblePassword] = useState(true);

    const [savedDataLabel, setSavedDataLabel] = useState([{label: "empty", value: ""}]);
    const [selectedData, setSelectedData] = useState(null);
    const [savedData, setSavedData] = useState([]);

    useEffect(() => {
        readData();
    }, []);

    const saveData = async (inputText) => {
        var tsave = {
            "label": inputText,
            "value": inputText,
            "uri": uri,
            "clientId": clientId,
            "userName": userName,
            "password": password,
            "channels": channels,
        };
        try {
            var arr = [];
            var isOverwriteIndex = null;
            var savedConfig = await AsyncStorage.getItem("@mqttserverconfig")
            if(savedConfig){
                arr = JSON.parse(savedConfig);
                arr.map((itm, index) => {
                    if(itm.label == tsave.label) isOverwriteIndex = index;
                });
                if(isOverwriteIndex){
                    arr[isOverwriteIndex] = tsave;
                    Alert.alert('Success', "config overwrited", [
                        { text: 'OK', onPress: () => console.log('OK Pressed') },
                    ]);
                } else {
                    arr.push(tsave);
                    Alert.alert('Success', "config created", [
                        { text: 'OK', onPress: () => console.log('OK Pressed') },
                    ]);
                }
            } else {
                var arr = [];
                arr.push(tsave);
            }
            await AsyncStorage.setItem("@mqttserverconfig", JSON.stringify(arr));
            console.log('Data successfully saved');
            readData();
        } catch (e) {
            console.log('Failed to save the data to the storage');
        }
    }
    const readData = async () => {
        try {
            var savedConfig = await AsyncStorage.getItem("@mqttserverconfig")
            savedConfig = JSON.parse(savedConfig);
            if (savedConfig !== null) {
                var temp = [];
                savedConfig.map(el => {
                    temp.push({label: el.label, value: el.label},);
                })
                setSavedData(savedConfig);
                setSavedDataLabel(temp);
            }
        } catch (e) {
            console.log('Failed to fetch the data from storage');
            console.log('reset async storage');
            await AsyncStorage.removeItem("@mqttserverconfig");
            console.log('successful');
        }
    }

    const resetStorage = async () => {
        try {
            await AsyncStorage.removeItem("@mqttserverconfig");
            setSavedDataLabel([{label: "empty", value: ""}]);
        } catch (e) {
            console.log('Fail');
        }
    }

    const removeStorageByLabel = async () => {
        try {
            var tempSavedData = [...savedData];
            var filteredAry = tempSavedData.filter(function(e) { return e.label !== selectedData })
            await AsyncStorage.removeItem("@mqttserverconfig");
            await AsyncStorage.setItem("@mqttserverconfig", JSON.stringify(filteredAry));
            readData();
            setUri();
            setClientId();
            setUserName();
            setPassword();
            setChannels([]);
        } catch (e) {
            console.log('Fail');
        }
    }

    function setSaved(value){
        var result = savedData.filter(obj => {
            return obj.label === value
        });
        if(result.length != 0){
            setUri(result[0].uri);
            setClientId(result[0].clientId);
            setUserName(result[0].userName);
            setPassword(result[0].password);
            setChannels(result[0].channels);
            setSelectedData(value);
        }
    }

    function connect() {
        console.log("channels");
        console.log(channels);
        props.setConf(uri, clientId,userName,password,channels);
    }
    function add() {
        let tempItem = [];
        tempItem = [...channels];
        tempItem.push({
            label: null,
            channel: null,
            type: null,
            value: null
        });
        setChannels(tempItem);
    }
    function remove() {
        let tempItem = [...channels];
        if(tempItem.length != 1){
            tempItem.splice(tempItem.length-1, 1);
            setChannels(tempItem);
        } else {
            setChannels([{
                label: null,
                channel: null,
                type: null,
                value: null
            }]);
        }
    }
    function onChangeVal(value, index) {
        let tempItem = [...channels];
        tempItem[index] = value;
        setChannels(tempItem);
    }
    function showSaveAlert() {
        Alert.prompt(
        "Enter config name",
        "Enter server config name here",
        [
            {
            text: "cancel",
            onPress: () => console.log("Cancel Pressed")
            },
            {
            text: "save",
            onPress: value => saveData(value),
            }
        ],
        "plain-text"
        );
    }
    function showRemoveAlert() {
        Alert.prompt(
        "Alert",
        "Do you want to delete this config?",
        [
            {
            text: "cancel",
            onPress: () => console.log("Cancel Pressed")
            },
            {
            text: "confirm",
            onPress: value => removeStorageByLabel(),
            }
        ],
        "default"
        );
    }

    function setChannelValues(item,index,value,objname) {
        var tempChann = [...channels];
        if(objname == "type" && tempChann[index].type == "switch"){
            tempChann[index][objname] = value;
            tempChann[index].value = false;
        } else {
            tempChann[index][objname] = value;
        }
        setChannels(tempChann);
    }

    return (
    <View style={{ flex: 1 }}>
        <ScrollView style={{ height: "100%" }}>
            <View style={{ marginTop: 10,marginBottom: 5, marginLeft: 15, display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{color:"#5c5c5c"}}>server config:</Text>
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
                    secureTextEntry={visiblePassword}
                    textContentType="oneTimeCode"
                    onChangeText={setPassword}
                    value={password}
                    placeholder="password"
                />
                <TouchableOpacity
                  style={{ width: "8%", height: "100%" }}
                  onPress={() => {setVisiblePassword(!visiblePassword);}}
                >
                    {!visiblePassword ? <Entypo name="eye" size={18} color="black" /> : <Entypo name="eye-with-line" size={18} color="black" />}
                </TouchableOpacity>
            </View>
            <View style={{ marginTop: 10,marginBottom: 5, marginLeft: 15 }}>
                <Text style={{color:"#5c5c5c"}}>subscribe channels:</Text>
            </View>
            {channels.map((item, index)=>{
                return (
                <View key={index} style={styles.row}>
                    <View style={{width: "30%"}}>
                        <Text style={styles.title}>Name:</Text>
                        <TextInput 
                            style={styles.inputw100}
                            onChangeText={(value) => setChannelValues(item,index,value,"label")}
                            value={item.label}
                            placeholder="Living room"
                        />
                    </View>  
                    <View style={{width: "30%"}}>
                        <Text style={styles.title}>channel:</Text>
                        <TextInput 
                            style={styles.inputw100}
                            onChangeText={(value) => setChannelValues(item,index,value,"channel")}
                            value={item.channel}
                            placeholder="S/A0"
                        />
                    </View>  
                    <View style={{width: "30%"}}>
                        <Text style={styles.title}>type:</Text>
                        <RNPickerSelect
                            value={item.type}
                            onValueChange={(value) => setChannelValues(item,index,value,"type")}
                            items={[
                                { label: 'Switch', value: 'switch' },
                                { label: 'Number', value: 'number' },
                                { label: 'Text', value: 'text' },
                            ]}
                        />
                    </View>  
                </View>)
            })}
            <View style={{display: "flex", flexDirection: "row", justifyContent:"space-between", paddingHorizontal: 15}}>
                <View style={{ width: "25%", marginTop: 20, alignItems: "center"}}>
                    <TouchableOpacity
                        onPress={add}
                        style={styles.btn}
                    >
                        <Text style={styles.text}>
                            <AntDesign name="plus" size={18} color="black" />
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={{ width: "25%", marginTop: 20, alignItems: "center"}}>
                    <TouchableOpacity
                        onPress={remove}
                        style={styles.btn}
                    >
                        <Text style={styles.text}>
                            <MaterialIcons name="remove" size={18} color="black" />
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={{ width: "20%", marginTop: 20, alignItems: "center"}}>
                    <TouchableOpacity
                        onPress={showSaveAlert}
                        style={styles.btn}
                    >
                        <AntDesign name="save" size={18} color="black" />
                    </TouchableOpacity>
                </View>
                <View style={{ width: "20%", marginTop: 20, alignItems: "center"}}>
                    <TouchableOpacity
                        onPress={showRemoveAlert}
                        style={styles.btn}
                    >
                        <Feather name="trash" size={18} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
            
            {props.isConnected == true ? <View style={{marginVertical: 20, alignItems: "center"}}>
                <TouchableOpacity
                    onPress={props.disconnect}
                    style={styles.btn}
                >
                    <Text style={styles.text}>
                        Disconnect
                    </Text>
                </TouchableOpacity>
            </View>
            :
            <View style={{marginVertical: 20, alignItems: "center"}}>
                <TouchableOpacity
                    onPress={connect}
                    style={styles.btn}
                >
                    <Text style={styles.text}>
                        {props.isConnected == "loading" && "connecting..."}
                        {props.isConnected == false && "Connect"}
                    </Text>
                </TouchableOpacity>
            </View>}
        </ScrollView>
    </View>
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
    },
    title: {
        color: "#5c5c5c",
        marginBottom: 5
    },
    input: {
        width: "60%",
        textAlign: "right",
    },
    inputw100: {
        width: "100%"
    }
});