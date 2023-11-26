import React from 'react'
import { StyleSheet, Text, View, TouchableHighlight, Image } from 'react-native'
import * as Icons from "../../components/Icons";

type Props = {
    isRecording: boolean,
    setIsRecording: (isRecording: boolean) => void
    isLoading: boolean,
    recordingDuration: number | null,
    stopRecordingAndEnablePlayback: () => void,
    stopPlaybackAndBeginRecording: () => void,
    getMMSSFromMillis: (duration: number) => string

}

const BACKGROUND_COLOR = "#FFF8ED";
const LIVE_COLOR = "#FF0000";

export default function Recording({
    isRecording,
    setIsRecording,
    isLoading,
    recordingDuration,
    stopRecordingAndEnablePlayback,
    stopPlaybackAndBeginRecording,
    getMMSSFromMillis
}: Props) {


    const onRecordPressed = () => {
        if (isRecording) {
          stopRecordingAndEnablePlayback();
        } else {
            stopPlaybackAndBeginRecording();
        }
      };

    const getRecordingTimestamp = () => {
        if (recordingDuration != null) {
          return `${getMMSSFromMillis(recordingDuration)}`;
        }
        return `${getMMSSFromMillis(0)}`;
      }

  return (
    <View style={styles.recordingContainer}>
    <View />
    {/* Recording Button */}
    <TouchableHighlight
      underlayColor={BACKGROUND_COLOR}
      style={styles.wrapper}
      onPress={onRecordPressed}
      disabled={isLoading}
    >
      <Image style={styles.image} source={Icons.RECORD_BUTTON.module} />
    </TouchableHighlight>
    <View style={styles.recordingDataContainer}>
      <View />
      <Text
        style={[styles.liveText, { fontFamily: "cutive-mono-regular" }]}
      >
        {isRecording ? "LIVE" : ""}
      </Text>
      <View style={styles.recordingDataRowContainer}>
        <Image
          style={[
            styles.image,
            { opacity: isRecording ? 1.0 : 0.0 },
          ]}
          source={Icons.RECORDING.module}
        />
        <Text
          style={[
            styles.recordingTimestamp,
            { fontFamily: "cutive-mono-regular" },
          ]}
        >
          {getRecordingTimestamp()}
        </Text>
      </View>
      <View />
    </View>
    <View />
  </View>
  )
}

const styles = StyleSheet.create({
    recordingContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        alignSelf: "stretch",
        minHeight: Icons.RECORD_BUTTON.height,
        maxHeight: Icons.RECORD_BUTTON.height,
      },
      recordingDataContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: Icons.RECORD_BUTTON.height,
        maxHeight: Icons.RECORD_BUTTON.height,
        minWidth: Icons.RECORD_BUTTON.width * 3.0,
        maxWidth: Icons.RECORD_BUTTON.width * 3.0,
      },
      recordingDataRowContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: Icons.RECORDING.height,
        maxHeight: Icons.RECORDING.height,
      },
      image: {
        backgroundColor: BACKGROUND_COLOR,
      },
      wrapper: {},
      liveText: {
        color: LIVE_COLOR,
      },
      recordingTimestamp: {
        paddingLeft: 20,
      },
    }
)