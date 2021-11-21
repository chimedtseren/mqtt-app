import React,{ useState, useEffect } from 'react'
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native'
import { SettingsDividerShort, SettingsSwitch, } from "react-native-settings-components";

export default function Publish(props) {
    const [myFields, setMyFields] = useState([]);
    useEffect(() => {
        var temp = new Array(props.channels.length).fill(0);
        props.channels.map((element, index) => {
            let set = element.value
            if(element.type === "switch"){
                if(element.value == "on"){
                    set = true;
                } else {
                    set = false;
                }
            }
            temp[index] = set;
        });
        setMyFields(temp);
        console.log(temp);
    },[props.isConnected]);

    function onChangeVal(value, index) {
        let tempItem = [...myFields];
        tempItem[index] = value;
        setMyFields(tempItem);
    }

    function add(channel, val) {
        props.sendMessage(channel, val);
    }

    return (
        <ScrollView
            style={{
                flex: 1,
            }}
        >   
            {myFields.length >= 1 ? 
            <View>
                {props.channels.map((item, index)=>{
                    return (
                        <View key={index}>
                            <View style={{ marginTop: 10,marginBottom: 5, marginLeft: 15, display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={{color:"#5c5c5c"}}>channel: {item.channel}</Text>
                            </View>
                            {item.type == "switch" && 
                                <SettingsSwitch
                                    title={item.label+": "+item.value}
                                    onValueChange={(value) => onChangeVal(value, index)}
                                    value={myFields[index]}
                                />
                            }
                            {item.type == "text" && 
                                <View key={index} style={styles.row}>
                                    <Text>{item.label}: {item.value}</Text>
                                    <TextInput 
                                        style={styles.input}
                                        onChangeText={(value) => onChangeVal(value,index)}
                                        value={myFields[index]}
                                        placeholder="set value"
                                    />
                                </View>
                            }
                            {item.type == "number" && 
                                <View key={index} style={styles.row}>
                                    <Text style={{width: "80%"}}>{item.label}: {item.value}</Text>
                                    <TextInput 
                                        style={styles.input}
                                        onChangeText={(value) => onChangeVal(value,index)}
                                        value={myFields[index]}
                                        keyboardType ="numeric"
                                        placeholder="set value"
                                    />
                                </View>
                            }
                            {/* {props.channels.length != index+1 && <SettingsDividerShort />} */}
                            <View style={{marginVertical: 20, alignItems: "center"}}>
                                <TouchableOpacity
                                    onPress={() => add(item.channel, myFields[index])}
                                    style={styles.btn}
                                >
                                    <Text style={styles.text}>
                                        Set
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                })}
            </View>
            : 
            <View><Text>No connection</Text></View>
            }
        </ScrollView>
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
    }
});