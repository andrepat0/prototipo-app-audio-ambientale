import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image,
} from "react-native";
import Slider from "@react-native-community/slider";
import * as Icons from "../../components/Icons";
import { Dimensions } from "react-native";

type Props = {
    isPlaying: boolean;
    isPlaybackAllowed: boolean;
    isLoading: boolean;
    muted: boolean;
    soundPosition: number | null;
    soundDuration: number | null;
    shouldCorrectPitch: boolean;
    volume: number;
    rate: number;
    onPlayPausePressed: () => void;
    onSeekSliderValueChange: (value: number) => void;
    onSeekSliderSlidingComplete: (value: number) => void;
    onVolumeSliderValueChange: (value: number) => void;
    onRateSliderSlidingComplete: (value: number) => void;
    onPitchCorrectionPressed: () => void;
    onStopPressed: () => void;
    onMutePressed: () => void;
    getSeekSliderPosition: () => number;
    getMMSSFromMillis: (duration: number) => string;
    getPlaybackTimestamp: () => string;
    };

const BACKGROUND_COLOR = "#FFF8ED";
const LIVE_COLOR = "#FF0000";
const DISABLED_OPACITY = 0.5;
const RATE_SCALE = 3.0;

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");

export default function Registration({
    isPlaying,
    isPlaybackAllowed,
    isLoading,
    muted,
    onPlayPausePressed,
    onSeekSliderValueChange,
    onSeekSliderSlidingComplete,
    onVolumeSliderValueChange,
    onStopPressed,
    onMutePressed,
    getSeekSliderPosition,
    getPlaybackTimestamp,
}: Props) {
  return (
    <View
      style={[
        styles.halfScreenContainer,
        {
          opacity:
            !isPlaybackAllowed || isLoading
              ? DISABLED_OPACITY
              : 1.0,
        },
      ]}
    >
      <View />
      <View style={styles.playbackContainer}>
        <Slider
          style={styles.playbackSlider}
          trackImage={Icons.TRACK_1.module}
          thumbImage={Icons.THUMB_1.module}
          value={getSeekSliderPosition()}
          onValueChange={onSeekSliderValueChange}
          onSlidingComplete={onSeekSliderSlidingComplete}
          disabled={!isPlaybackAllowed || isLoading}
        />
        <Text
          style={[
            styles.playbackTimestamp,
            { fontFamily: "cutive-mono-regular" },
          ]}
        >
          {getPlaybackTimestamp()}
        </Text>
      </View>
      <View
        style={[styles.buttonsContainerBase, styles.buttonsContainerTopRow]}
      >
        <View style={styles.volumeContainer}>
          <TouchableHighlight
            underlayColor={BACKGROUND_COLOR}
            style={styles.wrapper}
            onPress={onMutePressed}
            disabled={!isPlaybackAllowed || isLoading}
          >
            <Image
              style={styles.image}
              source={
                muted
                  ? Icons.MUTED_BUTTON.module
                  : Icons.UNMUTED_BUTTON.module
              }
            />
          </TouchableHighlight>
          <Slider
            style={styles.volumeSlider}
            trackImage={Icons.TRACK_1.module}
            thumbImage={Icons.THUMB_2.module}
            value={1}
            onValueChange={onVolumeSliderValueChange}
            disabled={!isPlaybackAllowed || isLoading}
          />
        </View>
        <View style={styles.playStopContainer}>
          <TouchableHighlight
            underlayColor={BACKGROUND_COLOR}
            style={styles.wrapper}
            onPress={onPlayPausePressed}
            disabled={!isPlaybackAllowed || isLoading}
          >
            <Image
              style={styles.image}
              source={
                isPlaying
                  ? Icons.PAUSE_BUTTON.module
                  : Icons.PLAY_BUTTON.module
              }
            />
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor={BACKGROUND_COLOR}
            style={styles.wrapper}
            onPress={onStopPressed}
            disabled={!isPlaybackAllowed || isLoading}
          >
            <Image style={styles.image} source={Icons.STOP_BUTTON.module} />
          </TouchableHighlight>
        </View>
        <View />
      </View>
      {/* <View
      style={[
        styles.buttonsContainerBase,
        styles.buttonsContainerBottomRow,
      ]}
    >
      <Text style={styles.timestamp}>Rate:</Text>
      <Slider
        style={styles.rateSlider}
        trackImage={Icons.TRACK_1.module}
        thumbImage={Icons.THUMB_1.module}
        value={rate / RATE_SCALE}
        onSlidingComplete={_onRateSliderSlidingComplete}
        disabled={!isPlaybackAllowed || isLoading}
      />
      <TouchableHighlight
        underlayColor={BACKGROUND_COLOR}
        style={styles.wrapper}
        onPress={_onPitchCorrectionPressed}
        disabled={!isPlaybackAllowed || isLoading}
      >
        <Text style={[{ fontFamily: "cutive-mono-regular" }]}>
          PC: {shouldCorrectPitch ? "yes" : "no"}
        </Text>
      </TouchableHighlight>
    </View> */}
      <View />
    </View>
  );
}

const styles = StyleSheet.create({
    playStopContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        minWidth: ((Icons.PLAY_BUTTON.width + Icons.STOP_BUTTON.width) * 3.0) / 2.0,
        maxWidth: ((Icons.PLAY_BUTTON.width + Icons.STOP_BUTTON.width) * 3.0) / 2.0,
      },
  playbackTimestamp: {
    textAlign: "right",
    alignSelf: "stretch",
    paddingRight: 20,
  },
  halfScreenContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    minHeight: DEVICE_HEIGHT / 2.0,
    maxHeight: DEVICE_HEIGHT / 2.0,
  },
  playbackContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    minHeight: Icons.THUMB_1.height * 2.0,
    maxHeight: Icons.THUMB_1.height * 2.0,
    margin: 20,
  },
  playbackSlider: {
    alignSelf: "stretch",
  },
  liveText: {
    color: LIVE_COLOR,
  },
  recordingTimestamp: {
    paddingLeft: 20,
  },

  wrapper: {
    borderRadius: 5,
    padding: 5,
  },
  image: {
    backgroundColor: BACKGROUND_COLOR,
  },
  volumeSlider: {
    width: DEVICE_WIDTH / 2.0 - Icons.MUTED_BUTTON.width,
  },
  buttonsContainerBase: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonsContainerTopRow: {
    maxHeight: Icons.MUTED_BUTTON.height,
    alignSelf: "stretch",
    paddingRight: 20,
  },
  volumeContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: DEVICE_WIDTH / 2.0,
    maxWidth: DEVICE_WIDTH / 2.0,
  },
});
