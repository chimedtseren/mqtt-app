import React,{ useState } from 'react'
import { Button, StyleSheet, Text, View, StatusBar } from 'react-native';
import { Client, Message } from 'react-native-paho-mqtt';
import { TextInput } from 'react-native-gesture-handler';
// import socketclient from './Connect';

export default function Home(props) {
    const [valu, setValu] = useState();

    function send() {
        props.sendMessage(valu);
    }

    return (
        <View style={styles.container}>
            {props.isConnected == false && <Text>No connection</Text>}
            {props.isConnected == true && <View>
                <Text>БӨХӨГ НАРНЫ ЦАХИЛГААН СТАНЦЫН СКАДА</Text>
                <Text>Calculated Generations: { props.powerValue[0] }</Text>
                <Text>Calculated Generations: { props.powerValue[1] } MW</Text>
                <Text>Actual Power: { props.powerValue[2] } MW</Text>
                <Text>Actual Irradiance: { props.powerValue[3] } MW</Text>
                <Text>Set point of Output Suppression: { props.powerValue[4] } MW</Text>
                <Text>Amount of Suppressed Power*2: { props.powerValue[5] } MW</Text>
                <Text>Actual outside temperature: { props.powerValue[6] } MW</Text>
                <Text>Last updated: { props.powerValue[7] } MW</Text>
            </View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
},
});