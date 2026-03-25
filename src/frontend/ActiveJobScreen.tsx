import React, { useEffect, useState } from 'react';
import {
  Appearance,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useJobSession } from './JobSessionContext';
import { formatElapsedDuration, REFERENCE_IMAGE_URI } from './jobData';

type RootStackParamList = {
  ActiveJob: { jobId: string };
  VoiceNote: { jobId: string; mode?: 'voice' | 'text' };
  PhotoCapture: { jobId: string };
};

type Navigation = NativeStackNavigationProp<RootStackParamList, 'ActiveJob'>;
type ActiveJobRoute = RouteProp<RootStackParamList, 'ActiveJob'>;

type ThemeColors = {
  background: string;
  surface: string;
  surfaceSecondary: string;
  textPrimary: string;
  textSecondary: string;
  textHint: string;
  borderSecondary: string;
  timerBackground: string;
  timerLabel: string;
  timerText: string;
  timerMeta: string;
  actionPrimary: string;
  actionText: string;
  pillBackground: string;
  pillText: string;
};

const colors: Record<'light' | 'dark', ThemeColors> = {
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceSecondary: '#F4F6F8',
    textPrimary: '#111111',
    textSecondary: '#6B6B6B',
    textHint: '#8E8E93',
    borderSecondary: 'rgba(0,0,0,0.12)',
    timerBackground: '#0F2D54',
    timerLabel: 'rgba(255,255,255,0.64)',
    timerText: '#FFFFFF',
    timerMeta: 'rgba(255,255,255,0.76)',
    actionPrimary: '#0F2D54',
    actionText: '#FFFFFF',
    pillBackground: '#EAF3DE',
    pillText: '#3B6D11',
  },
  dark: {
    background: '#111111',
    surface: '#1C1C1E',
    surfaceSecondary: '#262629',
    textPrimary: '#F5F5F5',
    textSecondary: '#9A9AA0',
    textHint: '#6B6B70',
    borderSecondary: 'rgba(255,255,255,0.12)',
    timerBackground: '#0F2D54',
    timerLabel: 'rgba(255,255,255,0.64)',
    timerText: '#FFFFFF',
    timerMeta: 'rgba(255,255,255,0.76)',
    actionPrimary: '#0F2D54',
    actionText: '#FFFFFF',
    pillBackground: '#EAF3DE',
    pillText: '#3B6D11',
  },
};

export default function ActiveJobScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ActiveJobRoute>();
  const insets = useSafeAreaInsets();
  const { finishJob, getRecord } = useJobSession();
  const colorScheme = (useColorScheme() ?? Appearance.getColorScheme() ?? 'light') as
    | 'light'
    | 'dark';
  const theme = colors[colorScheme];
  const record = getRecord(route.params.jobId);
  const startTime = record?.activity.startTime ?? Date.now();
  const [elapsedSeconds, setElapsedSeconds] = useState(
    Math.max(0, Math.floor((Date.now() - startTime) / 1000)),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startTime) / 1000)));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  if (!record) {
    return (
      <SafeAreaView style={[styles.notFoundScreen, { backgroundColor: theme.background }]}>
        <StatusBar backgroundColor={theme.background} barStyle="light-content" translucent={false} />
        <Text style={[styles.notFoundText, { color: theme.textPrimary }]}>Job not found</Text>
      </SafeAreaView>
    );
  }

  const handleFinishJob = () => {
    finishJob(record.job.id);
    navigation.replace('PhotoCapture', { jobId: record.job.id });
  };

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
      <StatusBar
        backgroundColor={theme.timerBackground}
        barStyle="light-content"
        translucent={false}
      />

      <View
        style={[
          styles.timerBar,
          {
            backgroundColor: theme.timerBackground,
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <Text style={[styles.timerLabel, { color: theme.timerLabel }]}>JOB IN PROGRESS</Text>
        <Text style={[styles.timerText, { color: theme.timerText }]}>
          {formatElapsedDuration(elapsedSeconds)}
        </Text>
        <Text style={[styles.timerMeta, { color: theme.timerMeta }]}>
          Started at{' '}
          {new Date(startTime).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 128 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.borderSecondary,
            },
          ]}
        >
          <View style={styles.summaryHeader}>
            <View style={styles.summaryHeaderText}>
              <Text style={[styles.siteName, { color: theme.textPrimary }]}>
                {record.job.siteName}
              </Text>
              <Text style={[styles.jobMeta, { color: theme.textSecondary }]}>
                {record.job.timeWindow} {'\u2022'} {record.job.jobType}
              </Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: theme.pillBackground }]}>
              <Text style={[styles.statusPillText, { color: theme.pillText }]}>Tracking</Text>
            </View>
          </View>

          <View style={[styles.detailRow, { borderTopColor: theme.borderSecondary }]}>
            <Text style={[styles.detailLabel, { color: theme.textHint }]}>ADDRESS</Text>
            <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
              {record.job.address}
            </Text>
          </View>

          <View style={[styles.detailRow, { borderTopColor: theme.borderSecondary }]}>
            <Text style={[styles.detailLabel, { color: theme.textHint }]}>TASK SUMMARY</Text>
            <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
              {record.job.issue}
            </Text>
          </View>

          <View style={[styles.detailRow, { borderTopColor: theme.borderSecondary }]}>
            <Text style={[styles.detailLabel, { color: theme.textHint }]}>WORK AREA</Text>
            <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
              {record.job.zoneLabel}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.guidanceCard,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.borderSecondary,
            },
          ]}
        >
          <Text style={[styles.guidanceTitle, { color: theme.textPrimary }]}>
            Work first. Logging happens after.
          </Text>
          <Text style={[styles.guidanceBody, { color: theme.textSecondary }]}>
            Leave the phone alone while the timer runs. When the job is done, tap Finish Job and
            add final site photos for proof of work.
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('VoiceNote', { jobId: record.job.id })}
            style={({ pressed }) => [
              styles.voiceNoteButton,
              {
                backgroundColor: theme.surface,
                borderColor: theme.borderSecondary,
                opacity: pressed ? 0.92 : 1,
              },
            ]}
          >
            <Text style={[styles.voiceNoteButtonText, { color: theme.textPrimary }]}>
              Record Voice Note
            </Text>
            <Text style={[styles.voiceNoteButtonMeta, { color: theme.textSecondary }]}>
              {record.activity.voiceNotes.length > 0
                ? `${record.activity.voiceNotes.length} saved`
                : 'Optional during the active session'}
            </Text>
          </Pressable>
        </View>

        {record.activity.voiceNotes.length > 0 ? (
          <View
            style={[
              styles.latestNoteCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.borderSecondary,
              },
            ]}
          >
            <Text style={[styles.latestNoteLabel, { color: theme.textHint }]}>LATEST NOTE</Text>
            <Text style={[styles.latestNoteText, { color: theme.textPrimary }]}>
              {record.activity.voiceNotes[record.activity.voiceNotes.length - 1]?.transcript}
            </Text>
          </View>
        ) : null}

        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionLabel, { color: theme.textHint }]}>REFERENCE</Text>
          <View
            style={[
              styles.referenceCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.borderSecondary,
              },
            ]}
          >
            <Image resizeMode="cover" source={{ uri: REFERENCE_IMAGE_URI }} style={styles.referenceImage} />
            <View style={[styles.referenceCopy, { backgroundColor: theme.surfaceSecondary }]}>
              <Text style={[styles.referenceTitle, { color: theme.textPrimary }]}>
                Existing Site Context
              </Text>
              <Text style={[styles.referenceText, { color: theme.textSecondary }]}>
                Keep any reference or arrival context lightweight. Final photos remain the main proof-of-work step in the MVP.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

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
        <Pressable
          accessibilityRole="button"
          onPress={handleFinishJob}
          style={({ pressed }) => [
            styles.finishButton,
            {
              backgroundColor: theme.actionPrimary,
              opacity: pressed ? 0.92 : 1,
            },
          ]}
        >
          <Text style={[styles.finishButtonText, { color: theme.actionText }]}>Finish Job</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
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
    fontWeight: '600',
  },
  timerBar: {
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  timerLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  timerText: {
    fontSize: 44,
    fontWeight: '700',
    marginTop: 10,
  },
  timerMeta: {
    fontSize: 15,
    marginTop: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  summaryCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  summaryHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  summaryHeaderText: {
    flex: 1,
    marginRight: 12,
  },
  siteName: {
    fontSize: 22,
    fontWeight: '700',
  },
  jobMeta: {
    fontSize: 14,
    marginTop: 6,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailRow: {
    borderTopWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 15,
    lineHeight: 22,
  },
  guidanceCard: {
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 18,
    padding: 18,
  },
  guidanceTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  guidanceBody: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  voiceNoteButton: {
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  voiceNoteButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  voiceNoteButtonMeta: {
    fontSize: 13,
    marginTop: 6,
  },
  latestNoteCard: {
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 18,
    padding: 18,
  },
  latestNoteLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  latestNoteText: {
    fontSize: 15,
    lineHeight: 22,
  },
  sectionBlock: {
    marginTop: 22,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  referenceCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  referenceImage: {
    height: 220,
    width: '100%',
  },
  referenceCopy: {
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  referenceTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  referenceText: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  ctaBar: {
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingHorizontal: 16,
    paddingTop: 14,
    position: 'absolute',
    right: 0,
  },
  finishButton: {
    alignItems: 'center',
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 56,
  },
  finishButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
});
