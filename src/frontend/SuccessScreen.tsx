import React, { useEffect, useLayoutEffect, useRef } from 'react';
import {
  Animated,
  Appearance,
  Easing,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

type JobStatus = 'overdue' | 'starting_soon' | 'in_progress' | 'scheduled' | 'completed';

type Job = {
  id: string;
  siteName: string;
  address: string;
  timeWindow: string;
  jobType: string;
  status: JobStatus;
  isHighlighted?: boolean;
};

type RootStackParamList = {
  JobsList: undefined;
  JobDetail: { jobId: string };
  Success: { jobId: string; duration: number };
};

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Success'>;
type SuccessRoute = RouteProp<RootStackParamList, 'Success'>;

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
  successBackground: string;
  successMark: string;
  statusOverdueBackground: string;
  statusOverdueText: string;
  statusStartingSoonBackground: string;
  statusStartingSoonText: string;
  statusInProgressBackground: string;
  statusInProgressText: string;
  statusScheduledBackground: string;
  statusScheduledText: string;
};

type StatusBadgeProps = {
  colors: ThemeColors;
  status: JobStatus;
};

const JOBS: Job[] = [
  {
    id: '1',
    siteName: 'Ridgewood Commons',
    address: '4510 Ridgewood Ave, Unit B',
    timeWindow: '10:00 – 11:30 AM',
    jobType: 'Sprinkler Repair',
    status: 'starting_soon',
    isHighlighted: true,
  },
  {
    id: '2',
    siteName: 'Hartwell Plaza',
    address: '78 Commerce Blvd',
    timeWindow: '8:00 – 9:30 AM',
    jobType: 'Backflow Test',
    status: 'overdue',
  },
  {
    id: '3',
    siteName: 'Elmwood Residential',
    address: '112 Elmwood Dr',
    timeWindow: '1:00 – 2:30 PM',
    jobType: 'Zone Inspection',
    status: 'scheduled',
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
    successBackground: '#EAF3DE',
    successMark: '#3B6D11',
    statusOverdueBackground: '#FCEBEB',
    statusOverdueText: '#A32D2D',
    statusStartingSoonBackground: '#E6F1FB',
    statusStartingSoonText: '#185FA5',
    statusInProgressBackground: '#EAF3DE',
    statusInProgressText: '#3B6D11',
    statusScheduledBackground: '#F1EFE8',
    statusScheduledText: '#5F5E5A',
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
    successBackground: '#EAF3DE',
    successMark: '#3B6D11',
    statusOverdueBackground: '#FCEBEB',
    statusOverdueText: '#A32D2D',
    statusStartingSoonBackground: '#E6F1FB',
    statusStartingSoonText: '#185FA5',
    statusInProgressBackground: '#EAF3DE',
    statusInProgressText: '#3B6D11',
    statusScheduledBackground: '#F1EFE8',
    statusScheduledText: '#5F5E5A',
  },
};

const STATUS_LABELS: Record<JobStatus, string> = {
  overdue: 'Overdue',
  starting_soon: 'Starting Soon',
  in_progress: 'In Progress',
  scheduled: 'Scheduled',
  completed: 'Completed',
};

function StatusBadge({ colors, status }: StatusBadgeProps) {
  const badgeStyles = getStatusBadgeStyle(colors, status);

  return (
    <View style={[styles.badgeBase, badgeStyles.container]}>
      <Text style={[styles.badgeTextBase, badgeStyles.text]}>{STATUS_LABELS[status]}</Text>
    </View>
  );
}

export default function SuccessScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<SuccessRoute>();
  const colorScheme = (useColorScheme() ?? Appearance.getColorScheme() ?? 'light') as
    | 'light'
    | 'dark';
  const theme = colors[colorScheme];
  const screenOpacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(8)).current;
  const lowerOpacity = useRef(new Animated.Value(0)).current;
  const lowerTranslateY = useRef(new Animated.Value(8)).current;
  const currentJob = JOBS.find((job) => job.id === route.params.jobId);
  const nextJob = JOBS.find((job) => job.id !== route.params.jobId && job.status !== 'completed');
  const endTime = Date.now();
  const statusBarStyle = colorScheme === 'dark' ? 'light-content' : 'dark-content';

  useLayoutEffect(() => {
    navigation.setOptions({ gestureEnabled: false });
  }, [navigation]);

  useEffect(() => {
    const sequence = Animated.parallel([
      Animated.timing(screenOpacity, {
        duration: 200,
        easing: Easing.out(Easing.ease),
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(200),
        Animated.spring(checkScale, {
          friction: 8,
          tension: 80,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(350),
        Animated.parallel([
          Animated.timing(textOpacity, {
            duration: 240,
            easing: Easing.out(Easing.ease),
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(textTranslateY, {
            duration: 240,
            easing: Easing.out(Easing.ease),
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(480),
        Animated.parallel([
          Animated.timing(lowerOpacity, {
            duration: 240,
            easing: Easing.out(Easing.ease),
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(lowerTranslateY, {
            duration: 240,
            easing: Easing.out(Easing.ease),
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]);

    sequence.start();

    return () => {
      sequence.stop();
    };
  }, [checkScale, lowerOpacity, lowerTranslateY, screenOpacity, textOpacity, textTranslateY]);

  const handleResetToJobs = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'JobsList' }],
    });
  };

  const handleOpenNext = () => {
    if (nextJob) {
      navigation.navigate('JobDetail', { jobId: nextJob.id });
      return;
    }

    handleResetToJobs();
  };

  if (!currentJob) {
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
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={statusBarStyle}
        translucent={false}
      />

      <Animated.View style={[styles.content, { opacity: screenOpacity }]}>
        <Animated.View style={{ transform: [{ scale: checkScale }] }}>
          <View style={[styles.successCircle, { backgroundColor: theme.successBackground }]}>
            <View style={styles.checkWrap}>
              <View
                style={[
                  styles.checkVerticalArm,
                  { backgroundColor: theme.successMark },
                ]}
              />
              <View
                style={[
                  styles.checkHorizontalArm,
                  { backgroundColor: theme.successMark },
                ]}
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.textBlock,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={[styles.title, { color: theme.textPrimary }]}>Submitted to Jobber</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {`${currentJob.siteName} · ${formatDuration(route.params.duration)} · ${formatTime(endTime)}`}
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.lowerBlock,
            {
              opacity: lowerOpacity,
              transform: [{ translateY: lowerTranslateY }],
            },
          ]}
        >
          {nextJob ? (
            <View style={styles.nextJobWrap}>
              <View style={[styles.nextJobCard, { backgroundColor: theme.surfaceSecondary }]}>
                <Text style={[styles.nextJobLabel, { color: theme.textHint }]}>Next job</Text>
                <Text style={[styles.nextJobSite, { color: theme.textPrimary }]}>
                  {nextJob.siteName}
                </Text>
                <View style={styles.nextJobMetaRow}>
                  <Text
                    numberOfLines={1}
                    style={[styles.nextJobAddress, { color: theme.textSecondary }]}
                  >
                    {nextJob.address}
                  </Text>
                  <StatusBadge colors={theme} status={nextJob.status} />
                </View>
              </View>
            </View>
          ) : null}

          <View style={styles.buttonRowWrap}>
            <View style={styles.buttonRow}>
              <Pressable
                accessibilityRole="button"
                onPress={handleResetToJobs}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.borderSecondary,
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.textPrimary }]}>
                  Jobs list
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={handleOpenNext}
                style={({ pressed }) => [
                  styles.primaryButton,
                  {
                    backgroundColor: theme.actionPrimary,
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}
              >
                <Text style={[styles.primaryButtonText, { color: theme.actionText }]}>
                  Open next job
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

function formatDuration(ms: number) {
  return `${Math.round(ms / 60000)} min`;
}

function formatTime(ms: number) {
  return new Date(ms).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusBadgeStyle(colors: ThemeColors, status: JobStatus) {
  switch (status) {
    case 'overdue':
      return {
        container: { backgroundColor: colors.statusOverdueBackground },
        text: { color: colors.statusOverdueText },
      };
    case 'starting_soon':
      return {
        container: { backgroundColor: colors.statusStartingSoonBackground },
        text: { color: colors.statusStartingSoonText },
      };
    case 'in_progress':
      return {
        container: { backgroundColor: colors.statusInProgressBackground },
        text: { color: colors.statusInProgressText },
      };
    case 'scheduled':
    case 'completed':
    default:
      return {
        container: { backgroundColor: colors.statusScheduledBackground },
        text: { color: colors.statusScheduledText },
      };
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
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
  successCircle: {
    alignItems: 'center',
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  checkWrap: {
    height: 18,
    transform: [{ rotate: '45deg' }],
    width: 22,
  },
  checkVerticalArm: {
    bottom: 0,
    height: 9,
    left: 0,
    position: 'absolute',
    width: 2.5,
  },
  checkHorizontalArm: {
    bottom: 0,
    height: 2.5,
    left: 0,
    position: 'absolute',
    width: 16,
  },
  textBlock: {
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    textAlign: 'center',
  },
  lowerBlock: {
    alignItems: 'center',
    width: '100%',
  },
  nextJobWrap: {
    marginTop: 24,
    paddingHorizontal: 24,
    width: '100%',
  },
  nextJobCard: {
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  nextJobLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.55,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  nextJobSite: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    textAlign: 'center',
  },
  nextJobMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  nextJobAddress: {
    fontSize: 12,
    marginRight: 8,
    maxWidth: 180,
    textAlign: 'center',
  },
  badgeBase: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeTextBase: {
    fontSize: 11,
    fontWeight: '500',
  },
  buttonRowWrap: {
    marginTop: 32,
    paddingHorizontal: 24,
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
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
});
