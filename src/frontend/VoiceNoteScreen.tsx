import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Appearance,
  Easing,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';

import { useJobSession } from './JobSessionContext';

type VoiceMode = 'voice' | 'text';

type RootStackParamList = {
  VoiceNote: { jobId: string; mode?: VoiceMode };
};

type Navigation = NativeStackNavigationProp<RootStackParamList, 'VoiceNote'>;
type VoiceNoteRoute = RouteProp<RootStackParamList, 'VoiceNote'>;

type ThemeColors = {
  background: string;
  surface: string;
  surfaceSecondary: string;
  textPrimary: string;
  textSecondary: string;
  textHint: string;
  borderSecondary: string;
  actionPrimary: string;
  actionText: string;
  linkPrimary: string;
  recordIdle: string;
  recordActive: string;
  recordRing: string;
  errorText: string;
};

const DEFAULT_TRANSCRIPT = 'Recording will appear here…';
const BACK_BUTTON_HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

const colors: Record<'light' | 'dark', ThemeColors> = {
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceSecondary: '#F4F6F8',
    textPrimary: '#111111',
    textSecondary: '#6B6B6B',
    textHint: '#AAAAAA',
    borderSecondary: 'rgba(0,0,0,0.15)',
    actionPrimary: '#0F2D54',
    actionText: '#FFFFFF',
    linkPrimary: '#185FA5',
    recordIdle: '#E24B4A',
    recordActive: '#A32D2D',
    recordRing: '#E24B4A',
    errorText: '#A32D2D',
  },
  dark: {
    background: '#111111',
    surface: '#1C1C1E',
    surfaceSecondary: '#262629',
    textPrimary: '#F5F5F5',
    textSecondary: '#999999',
    textHint: '#666666',
    borderSecondary: 'rgba(255,255,255,0.12)',
    actionPrimary: '#0F2D54',
    actionText: '#FFFFFF',
    linkPrimary: '#8CB8E8',
    recordIdle: '#E24B4A',
    recordActive: '#A32D2D',
    recordRing: '#E24B4A',
    errorText: '#F09595',
  },
};

export default function VoiceNoteScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<VoiceNoteRoute>();
  const insets = useSafeAreaInsets();
  const { addVoiceNote, getRecord } = useJobSession();
  const colorScheme = (useColorScheme() ?? Appearance.getColorScheme() ?? 'light') as
    | 'light'
    | 'dark';
  const theme = colors[colorScheme];
  const record = getRecord(route.params.jobId);
  const mode = route.params.mode ?? 'voice';
  const ringPulse = useRef(new Animated.Value(0)).current;
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasStopped, setHasStopped] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [transcript, setTranscript] = useState(DEFAULT_TRANSCRIPT);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const statusBarStyle = colorScheme === 'dark' ? 'light-content' : 'dark-content';

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        void recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (!isRecording) {
      ringPulse.stopAnimation();
      ringPulse.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, {
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          toValue: 1,
          useNativeDriver: false,
        }),
        Animated.timing(ringPulse, {
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          toValue: 0,
          useNativeDriver: false,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
      ringPulse.stopAnimation();
    };
  }, [isRecording, ringPulse]);

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const timer = setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRecording]);

  const animatedBorderColor = ringPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [withAlpha(theme.recordRing, 1), withAlpha(theme.recordRing, 0.3)],
  });

  if (!record) {
    return (
      <SafeAreaView style={[styles.notFoundScreen, { backgroundColor: theme.background }]}>
        <Text style={[styles.notFoundText, { color: theme.textPrimary }]}>Job not found</Text>
      </SafeAreaView>
    );
  }

  const handleToggleRecording = async () => {
    if (mode === 'text') {
      return;
    }

    if (!isRecording) {
      const granted = await requestRecordingPermission();

      if (!granted) {
        setPermissionDenied(true);
        return;
      }

      const recording = new Audio.Recording();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setPermissionDenied(false);
      setRecordedUri(null);
      setTranscript(DEFAULT_TRANSCRIPT);
      setElapsedSeconds(0);
      setHasStopped(false);
      setIsRecording(true);
      return;
    }

    const recording = recordingRef.current;

    if (!recording) {
      return;
    }

    await recording.stopAndUnloadAsync();
    const status = await recording.getStatusAsync();
    const uri = recording.getURI();
    recordingRef.current = null;
    setRecordedUri(uri ?? null);
    setTranscript(buildVoiceSummary(record.job.zoneLabel, Math.max(1, elapsedSeconds)));
    setElapsedSeconds(Math.max(1, Math.floor((status.durationMillis ?? 0) / 1000)));
    setIsRecording(false);
    setHasStopped(true);
  };

  const handleSave = () => {
    const trimmedTranscript = transcript.trim();

    if (mode === 'text' && !trimmedTranscript) {
      return;
    }

    if (mode === 'voice' && !hasStopped) {
      return;
    }

    addVoiceNote(record.job.id, {
      durationSeconds: mode === 'voice' ? elapsedSeconds : 0,
      id: `${Date.now()}`,
      mode,
      savedAt: Date.now(),
      transcript:
        mode === 'voice'
          ? trimmedTranscript || buildVoiceSummary(record.job.zoneLabel, elapsedSeconds)
          : trimmedTranscript,
      uri: mode === 'voice' ? recordedUri : null,
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={statusBarStyle}
        translucent={false}
      />

      <View
        style={[
          styles.navBar,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.borderSecondary,
            paddingTop: insets.top,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          hitSlop={BACK_BUTTON_HIT_SLOP}
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.navAction, pressed ? styles.pressed : null]}
        >
          <Text style={[styles.navActionText, { color: theme.linkPrimary }]}>Cancel</Text>
        </Pressable>

        <Text style={[styles.navTitle, { color: theme.textPrimary }]}>
          {mode === 'voice' ? 'Voice note' : 'Issue note'}
        </Text>

        <View style={styles.navSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.jobName, { color: theme.textSecondary }]}>{record.job.siteName}</Text>

        {mode === 'voice' ? (
          <>
            <Text style={[styles.timerText, { color: theme.textPrimary }]}>
              {formatDisplayTime(elapsedSeconds)}
            </Text>

            <Animated.View
              style={[
                styles.recordRing,
                {
                  borderColor: isRecording ? animatedBorderColor : theme.recordRing,
                },
              ]}
            >
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.8}
                onPress={() => {
                  void handleToggleRecording();
                }}
                style={[
                  styles.recordButton,
                  {
                    backgroundColor: isRecording ? theme.recordActive : theme.recordIdle,
                  },
                ]}
              >
                <View
                  style={[
                    styles.recordButtonGlyph,
                    isRecording ? styles.recordStopGlyph : null,
                    { backgroundColor: theme.actionText },
                  ]}
                />
              </TouchableOpacity>
            </Animated.View>

            <Text style={[styles.recordingHint, { color: theme.textSecondary }]}>
              {isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
            </Text>

            {permissionDenied ? (
              <Text style={[styles.inlineError, { color: theme.errorText }]}>
                Microphone access required.
              </Text>
            ) : null}
          </>
        ) : null}

        <View style={[styles.transcriptCard, { backgroundColor: theme.surfaceSecondary }]}>
          <Text style={[styles.transcriptLabel, { color: theme.textHint }]}>
            {mode === 'voice' ? 'Transcript preview' : 'Issue note'}
          </Text>
          {mode === 'voice' ? (
            <Text style={[styles.transcriptBody, { color: theme.textSecondary }]}>{transcript}</Text>
          ) : (
            <TextInput
              multiline
              onChangeText={setTranscript}
              placeholder="Describe the issue"
              placeholderTextColor={theme.textHint}
              style={[styles.transcriptInput, { color: theme.textPrimary }]}
              textAlignVertical="top"
              value={transcript === DEFAULT_TRANSCRIPT ? '' : transcript}
            />
          )}
        </View>
      </View>

      <View
        style={[
          styles.ctaBar,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.borderSecondary,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <View style={styles.ctaRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                backgroundColor: theme.surface,
                borderColor: theme.borderSecondary,
                opacity: pressed ? 0.92 : 1,
              },
            ]}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.textPrimary }]}>Cancel</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={mode === 'voice' ? !hasStopped : transcript.trim().length === 0}
            onPress={handleSave}
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: theme.actionPrimary,
                opacity:
                  mode === 'voice'
                    ? !hasStopped
                      ? 0.4
                      : pressed
                        ? 0.92
                        : 1
                    : transcript.trim().length === 0
                      ? 0.4
                      : pressed
                        ? 0.92
                        : 1,
              },
            ]}
          >
            <Text style={[styles.primaryButtonText, { color: theme.actionText }]}>Save note</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

async function requestRecordingPermission() {
  const permission = await Audio.requestPermissionsAsync();
  return permission.status === 'granted';
}

function buildVoiceSummary(zoneLabel: string, durationSeconds: number) {
  return `Voice note recorded for ${zoneLabel}. Duration ${formatDisplayTime(durationSeconds)}.`;
}

function formatDisplayTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');

  return `${minutes}:${seconds}`;
}

function withAlpha(hexColor: string, alpha: number) {
  const normalized = hexColor.replace('#', '');
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized;
  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);

  return `rgba(${red},${green},${blue},${alpha})`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  notFoundScreen: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: '400',
  },
  navBar: {
    alignItems: 'center',
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  navAction: {
    minWidth: 56,
  },
  navActionText: {
    fontSize: 14,
    fontWeight: '400',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 24,
  },
  navSpacer: {
    minWidth: 56,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  jobName: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  timerText: {
    fontSize: 28,
    fontVariant: ['tabular-nums'],
    fontWeight: '500',
    lineHeight: 32,
    marginBottom: 28,
    textAlign: 'center',
  },
  recordRing: {
    alignItems: 'center',
    borderRadius: 60,
    borderWidth: 3,
    height: 120,
    justifyContent: 'center',
    width: 120,
  },
  recordButton: {
    alignItems: 'center',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  recordButtonGlyph: {
    borderRadius: 20,
    height: 34,
    width: 34,
  },
  recordStopGlyph: {
    borderRadius: 6,
    height: 24,
    width: 24,
  },
  recordingHint: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 18,
    textAlign: 'center',
  },
  inlineError: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
    textAlign: 'center',
  },
  transcriptCard: {
    borderRadius: 12,
    marginTop: 24,
    minHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
  },
  transcriptLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.66,
    textTransform: 'uppercase',
  },
  transcriptBody: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  transcriptInput: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    minHeight: 84,
  },
  ctaBar: {
    borderTopWidth: 0.5,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  ctaRow: {
    flexDirection: 'row',
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 0.5,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  primaryButton: {
    borderRadius: 12,
    flex: 2,
    justifyContent: 'center',
    marginLeft: 8,
    paddingVertical: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.92,
  },
});
