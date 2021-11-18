import React,{ useState } from 'react'
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native'

export default function Publish(props) {
    const [value, setValue] = useState(new Array(props.channels.length));

    function onChangeVal(val, index) {
        let tempItem = [...value];
        tempItem[index] = val;
        setValue(tempItem);
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
            {props.channels.length == 0 && <View style={{ flex: 1,alignItems: 'center',justifyContent: 'center'}}><Text>No data</Text></View>}
            {props.channels.map((item,index)=>{
                return (
                <View key={index}>
                    <View style={{ marginTop: 10,marginBottom: 5, marginLeft: 15 }}>
                        <Text style={{color:"#5c5c5c"}}>channel: {item}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text>value:</Text>
                        <TextInput 
                            onChangeText={(value) => onChangeVal(value,index)}
                            value={value[index]}
                            placeholder="enter value"
                        />
                    </View>
                    <View style={{marginVertical: 10, alignItems: "center"}}>
                        <TouchableOpacity
                            onPress={() => add(item, value[index])}
                            style={styles.btn}
                        >
                            <Text style={styles.text}>
                                Send
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                )
            })}
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