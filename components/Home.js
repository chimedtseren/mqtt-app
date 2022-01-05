import React,{ useState, useEffect } from 'react'
import { RefreshControl, StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView } from 'react-native'
import { SettingsSwitch, } from "react-native-settings-components";

const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

export default function Home(props) {
    const [tempValue, setTempValue] = useState([]);
    const [tempStatus, setTempStatus] = useState([]);
    const [refreshing, setRefreshing] = React.useState(false);
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        props.setRefresh(Math.random);
        // props.reconnect();
        wait(1000).then(() => setRefreshing(false));
    }, []);
    
    useEffect(() => {
        var temp = new Array(props.channels.length).fill(0);
        var tempS = new Array(props.channels.length).fill(0);
        props.channels.map((element, index) => {
            let set = element.value;
            let tstatus = tempStatus[index];
            if(element.value == "Online" || element.value == "Offline"){
                tstatus = element.value;
                if(element.value == "Online"){
                    tstatus = "Online";
                }
                if(element.value == "Offline"){
                    tstatus = "Offline";
                }
            }
            if(element.type === "switch"){
                if(element.value == "On"){
                    set = true;
                } 
                if(element.value == "Off"){
                    set = false;
                }
            }
            temp[index] = set;
            tempS[index] = tstatus;
        });
        setTempValue(temp); 
        setTempStatus(tempS);
        if(props.isConnected == true){
            setRefreshing(false);
        }
    },[props.channels,props.isConnected]);

    // useEffect(() => {
    //     console.log("tempValue");
    //     // console.log(tempValue);

    // },[props.channels]);

    function onChangeVal(value, index, channel="unknown") {
        let tempItem = [...tempValue];
        tempItem[index] = value;
        setTempValue(tempItem);
        if(channel != "unknown"){
            add(channel, value);
        }
    }

    function add(channel, val) {
        props.sendMessage(channel, val);
    }

    return (
        <View style={{ flex: 1 }}>
            {/* <KeyboardAvoidingView style={{ justifyContent: 'flex-end' }} behavior="position" keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}> */}
                <ScrollView 
                  style={{ height: "100%" }}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }
                >
                    {props.isConnected == "loading" && <View style={{alignItems:"center", marginVertical: "10%"}}><Text>connecting...</Text></View>}
                    {tempValue.length >= 1 ? 
                    <View>
                        {props.channels.map((item, index)=>{
                            return (
                                <View key={index} style={{ width: "100%"}}>
                                    <View style={{ marginTop: 10,marginBottom: 5, marginLeft: 15, display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                        <Text style={{color:"#5c5c5c"}}>channel: {item.channel}</Text>
                                    </View>
                                    {item.type == "switch" && 
                                        <SettingsSwitch
                                            title={item.label + " status: " + tempStatus[index]}
                                            onValueChange={(value) => onChangeVal(value, index, item.channel)}
                                            value={tempValue[index]}
                                        />
                                    }
                                    {item.type == "text" && 
                                        <View key={index} style={styles.row}>
                                            <Text style={styles.txt}>{item.label} status: {tempStatus[index]}</Text>
                                            <TextInput 
                                                style={styles.input}
                                                returnKeyType={'done'}
                                                onSubmitEditing={() => {
                                                    add(item.channel, tempValue[index]);
                                                }}
                                                onChangeText={(value) => onChangeVal(value,index)}
                                                value={tempValue[index]}
                                                placeholder="set value"
                                            />
                                        </View>
                                    }
                                    {item.type == "number" && 
                                        <View key={index} style={styles.row}>
                                            <Text style={styles.txt}>{item.label} status: {tempStatus[index]}</Text>
                                            <TextInput 
                                                style={styles.input}
                                                returnKeyType={'done'}
                                                onSubmitEditing={() => {
                                                    add(item.channel, tempValue[index]);
                                                }}
                                                onChangeText={(value) => onChangeVal(value,index)}
                                                value={tempValue[index]}
                                                keyboardType="numeric"
                                                placeholder="set value"
                                            />
                                        </View>
                                    }
                                </View>
                            )
                        })}
                    </View>
                    : 
                    <View style={{alignItems:"center", marginTop: "20%"}}><Text>No connection</Text></View>
                    }
                </ScrollView>
            {/* </KeyboardAvoidingView> */}
        </View>
    )
}

const styles = StyleSheet.create({
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
    txt: {
        width: "50%"
    },
    input: {
        width: "50%",
        textAlign: "right"
    },
});