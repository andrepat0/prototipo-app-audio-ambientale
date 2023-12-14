import React, {useEffect} from 'react'
import { StyleSheet, Text, View } from 'react-native'

type Props = {
    styles: any,
    getRecording: (recording: any) => void,
    recording: any,
    isRecording: boolean
}

export default function RecordingLiveText({
    styles,
    getRecording,
    recording,
    isRecording
}: Props) {


    useEffect(() => {

        // Make a recording every 10 seconds, for 5 seconds when the register button is pressed
        // clear the interval when the stop button is pressed

        let intervalId = setInterval(() => {
            getRecording(
                recording
            );
        }, 2500);

        //Reset the interval when the stop button is pressed
        return () =>   clearInterval(intervalId);

    }, [isRecording]);


    return (
        <Text
            style={[styles.liveText, { fontFamily: "cutive-mono-regular" }]}
        >
            LIVE
        </Text>
    )
}