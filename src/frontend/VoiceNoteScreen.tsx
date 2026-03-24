import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Appearance,
  Easing,
  PermissionsAndroid,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type JobStatus = 'overdue' | 'starting_soon' | 'in_progress' | 'scheduled';

type Job = {
  id: string;
  siteName: string;
  address: string;
  timeWindow: string;
  jobType: string;
  status: JobStatus;
  isHighlighted?: boolean;
  phone: string;
  contactName: string;
  issue: string;
  zoneLabel: string;
};

type VoiceMode = 'voice' | 'text';

type RootStackParamList = {
  ActiveJob: { jobId: string; startTime?: number };
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

type RecorderResult = {
  start: () => Promise<void>;
  stop: () => Promise<string | null>;
  uri: string | null;
  permissionDenied: boolean;
};

type RecorderAdapter = {
  requestPermission: () => Promise<boolean>;
  start: () => Promise<void>;
  stop: () => Promise<string | null>;
};

type SavedNote = {
  jobId: string;
  mode: VoiceMode;
  transcript: string;
  uri: string | null;
  savedAt: number;
};

const DEFAULT_TRANSCRIPT = 'Recording will appear here…';
const FINAL_TRANSCRIPT = 'Zone 3 solenoid looks burned out, replacing now.';
const PARTIAL_TRANSCRIPT = 'Zone 3 solenoid looks burned out…';
const BACK_BUTTON_HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };
const savedNotesStore: Record<string, SavedNote> = {};

const JOBS: Job[] = [
  {
    id: '1',
    siteName: 'Ridgewood Commons',
    address: '4510 Ridgewood Ave, Unit B',
    timeWindow: '10:00 – 11:30 AM',
    jobType: 'Sprinkler Repair',
    status: 'starting_soon',
    isHighlighted: true,
    contactName: 'Ron Fielding',
    phone: '(416) 555-0188',
    issue:
      'Zone 3 not activating. Possible solenoid failure or broken line near south bed.',
    zoneLabel: 'Zone 3',
  },
  {
    id: '2',
    siteName: 'Hartwell Plaza',
    address: '78 Commerce Blvd',
    timeWindow: '8:00 – 9:30 AM',
    jobType: 'Backflow Test',
    status: 'overdue',
    contactName: 'Elena Torres',
    phone: '(416) 555-0142',
    issue:
      'Annual backflow inspection required after a failed valve reading last service cycle.',
    zoneLabel: 'Main Valve',
  },
  {
    id: '3',
    siteName: 'Elmwood Residential',
    address: '112 Elmwood Dr',
    timeWindow: '1:00 – 2:30 PM',
    jobType: 'Zone Inspection',
    status: 'scheduled',
    contactName: 'Marcus Chen',
    phone: '(416) 555-0176',
    issue:
      'Resident reported uneven coverage along the east lawn. Inspect heads, pressure, and timer programming.',
    zoneLabel: 'East Lawn',
  },
];

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
    linkPrimary: '#185FA5',
    recordIdle: '#E24B4A',
    recordActive: '#A32D2D',
    recordRing: '#E24B4A',
    errorText: '#F09595',
  },
};

export function useRecorder(): RecorderResult {
  const adapterRef = useRef<RecorderAdapter | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    let mounted = true;

    const configure = async () => {
      const adapter = createRecorderAdapter();
      adapterRef.current = adapter;
      const granted = await adapter.requestPermission();

      if (mounted) {
        setPermissionDenied(!granted);
      }
    };

    void configure();

    return () => {
      mounted = false;
    };
  }, []);

  const start = async () => {
    if (!adapterRef.current) {
      return;
    }

    await adapterRef.current.start();
  };

  const stop = async () => {
    if (!adapterRef.current) {
      return null;
    }

    const nextUri = await adapterRef.current.stop();
    setUri(nextUri);
    return nextUri;
  };

  return {
    start,
    stop,
    uri,
    permissionDenied,
  };
}

export default function VoiceNoteScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<VoiceNoteRoute>();
  const insets = useSafeAreaInsets();
  const colorScheme = (useColorScheme() ?? Appearance.getColorScheme() ?? 'light') as
    | 'light'
    | 'dark';
  const theme = colors[colorScheme];
  const job = JOBS.find((item) => item.id === route.params.jobId);
  const mode = route.params.mode ?? 'voice';
  const recorder = useRecorder();
  const ringPulse = useRef(new Animated.Value(0)).current;
  const [isRecording, setIsRecording] = useState(false);
  const [hasStopped, setHasStopped] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [transcript, setTranscript] = useState(DEFAULT_TRANSCRIPT);
  const statusBarStyle = colorScheme === 'dark' ? 'light-content' : 'dark-content';

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

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    if (elapsedSeconds >= 5) {
      setTranscript(FINAL_TRANSCRIPT);
      return;
    }

    if (elapsedSeconds >= 2) {
      setTranscript(PARTIAL_TRANSCRIPT);
    }
  }, [elapsedSeconds, isRecording]);

  const animatedBorderColor = ringPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [withAlpha(theme.recordRing, 1), withAlpha(theme.recordRing, 0.3)],
  });

  const handleToggleRecording = async () => {
    if (recorder.permissionDenied) {
      return;
    }

    if (!isRecording) {
      setTranscript(DEFAULT_TRANSCRIPT);
      setElapsedSeconds(0);
      await recorder.start();
      setHasStopped(false);
      setIsRecording(true);
      return;
    }

    await recorder.stop();
    setIsRecording(false);
    setHasStopped(true);
  };

  const handleSave = () => {
    if (!hasStopped) {
      return;
    }

    savedNotesStore[route.params.jobId] = {
      jobId: route.params.jobId,
      mode,
      transcript,
      uri: recorder.uri,
      savedAt: Date.now(),
    };

    navigation.goBack();
  };

  let recordingHint = 'Tap to record';

  if (isRecording) {
    recordingHint = 'Recording… tap to stop';
  } else if (hasStopped) {
    recordingHint = 'Tap to record again';
  }

  if (!job) {
    return (
      <SafeAreaView style={[styles.notFoundScreen, { backgroundColor: theme.background }]}>
        <StatusBar
          backgroundColor={theme.background}
          barStyle={statusBarStyle}
          translucent={false}
        />
        <Text style={[styles.notFoundText, { color: theme.textPrimary }]}>Job not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
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

        <Text style={[styles.navTitle, { color: theme.textPrimary }]}>Voice note</Text>

        <View style={styles.navSpacer} />
      </View>

      <View style={styles.content}>
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
          {recordingHint}
        </Text>

        {recorder.permissionDenied ? (
          <Text style={[styles.inlineError, { color: theme.errorText }]}>
            Microphone access required.
          </Text>
        ) : null}

        <View style={[styles.transcriptCard, { backgroundColor: theme.surfaceSecondary }]}>
          <Text style={[styles.transcriptLabel, { color: theme.textHint }]}>
            Transcript preview
          </Text>
          <Text style={[styles.transcriptBody, { color: theme.textSecondary }]}>
            {transcript}
          </Text>
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
            disabled={!hasStopped}
            onPress={handleSave}
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: theme.actionPrimary,
                opacity: !hasStopped ? 0.4 : pressed ? 0.92 : 1,
              },
            ]}
          >
            <Text style={[styles.primaryButtonText, { color: theme.actionText }]}>
              Save note
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createRecorderAdapter(): RecorderAdapter {
  const expoAv = safeRequire('expo-av');

  if (expoAv?.Audio?.Recording) {
    return createExpoRecorderAdapter(expoAv.Audio);
  }

  const audioRecorderPlayerModule = safeRequire('react-native-audio-recorder-player');

  if (audioRecorderPlayerModule) {
    return createAudioRecorderPlayerAdapter(audioRecorderPlayerModule);
  }

  return createMockRecorderAdapter();
}

function createExpoRecorderAdapter(AudioModule: any): RecorderAdapter {
  let recording: any = null;

  return {
    requestPermission: async () => {
      const result = await AudioModule.requestPermissionsAsync();
      return result.status === 'granted';
    },
    start: async () => {
      await AudioModule.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const created = new AudioModule.Recording();
      await created.prepareToRecordAsync(
        AudioModule.RecordingOptionsPresets?.HIGH_QUALITY ??
          AudioModule.RecordingOptionsPresets?.LOW_QUALITY,
      );
      await created.startAsync();
      recording = created;
    },
    stop: async () => {
      if (!recording) {
        return null;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI?.() ?? null;
      recording = null;
      return uri;
    },
  };
}

function createAudioRecorderPlayerAdapter(moduleRef: any): RecorderAdapter {
  const RecorderClass = moduleRef.default ?? moduleRef;
  const recorder = typeof RecorderClass === 'function' ? new RecorderClass() : RecorderClass;

  return {
    requestPermission: async () => {
      if (Platform.OS !== 'android') {
        return true;
      }

      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );

      return result === PermissionsAndroid.RESULTS.GRANTED;
    },
    start: async () => {
      await recorder.startRecorder?.();
    },
    stop: async () => {
      const uri = await recorder.stopRecorder?.();
      return uri ?? null;
    },
  };
}

function createMockRecorderAdapter(): RecorderAdapter {
  return {
    requestPermission: async () => true,
    start: async () => undefined,
    stop: async () => `mock://voice-note-${Date.now()}.m4a`,
  };
}

function safeRequire(moduleName: string): any {
  try {
    return require(moduleName);
  } catch {
    return null;
  }
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
