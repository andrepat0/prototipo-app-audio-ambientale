import React, { useState, useEffect, useRef } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Audio, InterruptionModeIOS, InterruptionModeAndroid, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from "expo-file-system";
import * as Font from "expo-font";
import * as Permissions from "expo-permissions";
import * as Icons from "./components/Icons";
import Recording from "./pages/recording/recording";
import Registration from "./pages/registration/registration";

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");
const BACKGROUND_COLOR = "#FFF8ED";
const LIVE_COLOR = "#FF0000";
const DISABLED_OPACITY = 0.5;
const RATE_SCALE = 3.0;

export default function App() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [shouldPlayAtEndOfSeek, setShouldPlayAtEndOfSeek] = useState(false);
  const [haveRecordingPermissions, setHaveRecordingPermissions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaybackAllowed, setIsPlaybackAllowed] = useState(false);
  const [muted, setMuted] = useState(false);
  const [soundPosition, setSoundPosition] = useState<number | null>(null);
  const [soundDuration, setSoundDuration] = useState<number | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<number | null>(null);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [shouldCorrectPitch, setShouldCorrectPitch] = useState(true);
  const [volume, setVolume] = useState(1.0);
  const [rate, setRate] = useState(1.0);


  useEffect(() => {
    const askForPermissions = async () => {
      const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
      setHaveRecordingPermissions(response.status === 'granted');
    };

    const loadFont = async () => {
      await Font.loadAsync({
        'cutive-mono-regular': require('./assets/fonts/CutiveMono-Regular.ttf'),
      });
      setFontLoaded(true);
    };



    askForPermissions();
    loadFont();
  }, []);

  const updateScreenForSoundStatus = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setSoundDuration(status.durationMillis ?? null);
      setSoundPosition(status.positionMillis);
      setShouldPlay(status.shouldPlay);
      setIsPlaying(status.isPlaying);
      setRate(status.rate);
      setMuted(status.isMuted);
      setVolume(status.volume);
      setShouldCorrectPitch(status.shouldCorrectPitch);
      setIsPlaybackAllowed(true);
    } else {
      setSoundDuration(null);
      setSoundPosition(null);
      setIsPlaybackAllowed(false);
      if (status.error) {
        console.log(`FATAL PLAYER ERROR: ${status.error}`);
      }
    }
  };

  const updateScreenForRecordingStatus = (status: Audio.RecordingStatus) => {

    // if(status.isRecording){
    //   console.log("Recording")
    // }

    if (status.canRecord) {
      setIsRecording(status.isRecording);
      setRecordingDuration(status.durationMillis);
    } else if (status.isDoneRecording) {
      setIsRecording(false);
      setRecordingDuration(status.durationMillis);
      if (!isLoading) {
        stopRecordingAndEnablePlayback();
      }
    }
  };

  const stopPlaybackAndBeginRecording = async () => {
    setIsLoading(true);
    if (sound !== null) {
      await sound.unloadAsync();
      sound.setOnPlaybackStatusUpdate(null);
      setSound(null);
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });
    if (recording !== null) {
      recording.setOnRecordingStatusUpdate(null);
      setRecording(null);
    }

    const newRecording = new Audio.Recording();
    await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    newRecording.setOnRecordingStatusUpdate(updateScreenForRecordingStatus);

    setRecording(newRecording);
    await newRecording.startAsync();


    setIsLoading(false);
  };

  const getRecording = async (newRecording: any) => {

    if (!newRecording) return;

    try {
      const getURI = newRecording.getURI();
      const info = await FileSystem.getInfoAsync(getURI || '');
      const uri = info.uri;

      // Use file extension directly
      const fileType = info.uri.split('.').pop();

      const formData = new FormData();
      formData.append('file', {
        uri,
        name: `recording.${fileType}`,
        type: `audio/${fileType}`, // Use correct MIME type

        // Add other potential configurations here if needed
      });

      const response = await fetch('https://eo5mejif3z95pzl.m.pipedream.net', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Log the response for debugging
      console.log('Upload Response:', response.status, response.statusText);
    } catch (error) {
      console.error('Error getting/recording:', error);
    }
  };

  const stopRecordingAndEnablePlayback = async () => {
    setIsLoading(true);
    if (!recording) {
      return;
    }
    try {
      await recording.stopAndUnloadAsync();
    } catch (error) {
      if (error && error.code === 'E_AUDIO_NODATA') {
        console.log(`Stop was called too quickly, no data has yet been received (${error?.message ?? ''})`);
      } else {
        console.log('STOP ERROR: ', error ? error : '');
      }
      setIsLoading(false);
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });
    const { sound: newSound, status } = await recording.createNewLoadedSoundAsync(
      {
        isLooping: true,
        isMuted: muted,
        volume,
        rate,
        shouldCorrectPitch,
      },
      updateScreenForSoundStatus
    );
    setSound(newSound);

    setIsLoading(false);
  };

  const onPlayPausePressed = () => {
    if (sound !== null) {
      if (isPlaying) {
        sound.pauseAsync();
      } else {
        sound.playAsync();
      }
    }
  };

  const onStopPressed = () => {
    if (sound !== null) {
      sound.stopAsync();
    }
  };

  const onMutePressed = () => {
    if (sound !== null) {
      sound.setIsMutedAsync(!muted);
    }
  };

  const onVolumeSliderValueChange = (value: number) => {
    if (sound !== null) {
      sound.setVolumeAsync(value);
    }
  };

  const trySetRate = async (newRate: number, newShouldCorrectPitch: boolean) => {
    if (sound !== null) {
      try {
        await sound.setRateAsync(newRate, newShouldCorrectPitch);
      } catch (error) {
        // Rate changing could not be performed, possibly because the client's Android API is too old.
      }
    }
  };

  const onRateSliderSlidingComplete = async (value: number) => {
    trySetRate(value * RATE_SCALE, shouldCorrectPitch);
  };

  const onPitchCorrectionPressed = () => {
    trySetRate(rate, !shouldCorrectPitch);
  };

  const onSeekSliderValueChange = (value: number) => {
    if (sound !== null && !isSeeking) {
      setIsSeeking(true);
      setShouldPlayAtEndOfSeek(shouldPlay);
      sound.pauseAsync();
    }
  };

  const onSeekSliderSlidingComplete = async (value: number) => {
    if (sound !== null) {
      setIsSeeking(false);
      const seekPosition = value * (soundDuration || 0);
      if (shouldPlayAtEndOfSeek) {
        sound.playFromPositionAsync(seekPosition);
      } else {
        sound.setPositionAsync(seekPosition);
      }
    }
  };

  const getSeekSliderPosition = () => {
    if (sound !== null && soundPosition !== null && soundDuration !== null) {
      return soundPosition / soundDuration;
    }
    return 0;
  };

  const getMMSSFromMillis = (millis: number) => {
    const totalSeconds = millis / 1000;
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor(totalSeconds / 60);

    const padWithZero = (number: number) => {
      const string = number.toString();
      if (number < 10) {
        return '0' + string;
      }
      return string;
    };
    return padWithZero(minutes) + ':' + padWithZero(seconds);
  };

  const getPlaybackTimestamp = () => {
    if (sound !== null && soundPosition !== null && soundDuration !== null) {
      return `${getMMSSFromMillis(soundPosition)} / ${getMMSSFromMillis(soundDuration)}`;
    }
    return '';
  };

  if (!fontLoaded) {
    return <View style={styles.emptyContainer} />;
  }

  if (!haveRecordingPermissions) {
    return (
      <View style={styles.container}>
        <View />
        <Text style={[styles.noPermissionsText, { fontFamily: 'cutive-mono-regular' }]}>
          You must enable audio recording permissions in order to use this app.
        </Text>
        <View />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.halfScreenContainer,
          {
            opacity: isLoading ? DISABLED_OPACITY : 1.0,
          },
        ]}
      >
        <View />
        <Recording
          recording={recording}
          getRecording={getRecording}
          isLoading={isLoading}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          recordingDuration={recordingDuration}
          stopRecordingAndEnablePlayback={stopRecordingAndEnablePlayback}
          stopPlaybackAndBeginRecording={stopPlaybackAndBeginRecording}
          getMMSSFromMillis={getMMSSFromMillis}
        />
        <View />
      </View>
      <Registration
        isPlaying={isPlaying}
        isPlaybackAllowed={isPlaybackAllowed}
        isLoading={isLoading}
        muted={muted}
        soundPosition={soundPosition}
        soundDuration={soundDuration}
        shouldCorrectPitch={shouldCorrectPitch}
        volume={volume}
        rate={rate}
        onPlayPausePressed={onPlayPausePressed}
        onSeekSliderValueChange={onSeekSliderValueChange}
        onSeekSliderSlidingComplete={onSeekSliderSlidingComplete}
        onVolumeSliderValueChange={onVolumeSliderValueChange}
        onRateSliderSlidingComplete={onRateSliderSlidingComplete}
        onPitchCorrectionPressed={onPitchCorrectionPressed}
        onStopPressed={onStopPressed}
        onMutePressed={onMutePressed}
        getSeekSliderPosition={getSeekSliderPosition}
        getMMSSFromMillis={getMMSSFromMillis}
        getPlaybackTimestamp={getPlaybackTimestamp}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    alignSelf: "stretch",
    backgroundColor: BACKGROUND_COLOR,
  },
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: BACKGROUND_COLOR,
    minHeight: DEVICE_HEIGHT,
    maxHeight: DEVICE_HEIGHT,
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
  noPermissionsText: {
    textAlign: "center",
  },
});
