import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { formatDurationFromMs } from './jobData';

type RootStackParamList = {
  PhotoCapture: { jobId: string };
  ReviewReport: { jobId: string };
  Success: { jobId: string };
};

type Navigation = NativeStackNavigationProp<RootStackParamList, 'ReviewReport'>;
type ReviewReportRoute = RouteProp<RootStackParamList, 'ReviewReport'>;

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
  accentBackground: string;
  accentText: string;
};

const colors: Record<'light' | 'dark', ThemeColors> = {
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceSecondary: '#F4F6F8',
    textPrimary: '#111111',
    textSecondary: '#6B6B6B',
    textHint: '#8E8E93',
    borderSecondary: 'rgba(0,0,0,0.15)',
    actionPrimary: '#0F2D54',
    actionText: '#FFFFFF',
    accentBackground: '#EAF3DE',
    accentText: '#3B6D11',
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
    accentBackground: '#EAF3DE',
    accentText: '#3B6D11',
  },
};

export default function ReviewReportScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ReviewReportRoute>();
  const insets = useSafeAreaInsets();
  const { getRecord, submitJob } = useJobSession();
  const colorScheme = (useColorScheme() ?? Appearance.getColorScheme() ?? 'light') as
    | 'light'
    | 'dark';
  const theme = colors[colorScheme];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const record = getRecord(route.params.jobId);
  const statusBarStyle = colorScheme === 'dark' ? 'light-content' : 'dark-content';

  if (!record) {
    return (
      <SafeAreaView style={[styles.notFoundScreen, { backgroundColor: theme.background }]}>
        <Text style={[styles.notFoundText, { color: theme.textPrimary }]}>Job not found</Text>
      </SafeAreaView>
    );
  }

  const duration =
    record.activity.startTime && record.activity.endTime
      ? record.activity.endTime - record.activity.startTime
      : 0;

  const handleSubmitToJobber = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    submitJob(record.job.id);
    setIsSubmitting(false);
    navigation.replace('Success', { jobId: record.job.id });
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
          styles.header,
          {
            borderBottomColor: theme.borderSecondary,
            paddingTop: insets.top,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed ? styles.pressed : null]}
        >
          <Text style={[styles.backButtonText, { color: theme.textSecondary }]}>Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Submit to Jobber</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 136 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.badge,
            {
              backgroundColor: theme.accentBackground,
            },
          ]}
        >
          <Text style={[styles.badgeText, { color: theme.accentText }]}>
            Auto-generated from current job activity
          </Text>
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.borderSecondary,
            },
          ]}
        >
          <ReportRow label="Site" theme={theme} value={record.job.siteName} />
          <ReportRow
            label="Start"
            theme={theme}
            value={formatTime(record.activity.startTime)}
          />
          <ReportRow label="End" theme={theme} value={formatTime(record.activity.endTime)} />
          <ReportRow label="Duration" theme={theme} value={formatDurationFromMs(duration)} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textHint }]}>VOICE NOTES</Text>
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.borderSecondary,
              },
            ]}
          >
            {record.activity.voiceNotes.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No voice notes captured.
              </Text>
            ) : (
              record.activity.voiceNotes.map((note, index) => (
                <View
                  key={note.id}
                  style={[
                    styles.noteRow,
                    index > 0 ? { borderTopColor: theme.borderSecondary, borderTopWidth: 1 } : null,
                  ]}
                >
                  <Text style={[styles.noteText, { color: theme.textPrimary }]}>{note.transcript}</Text>
                  <Text style={[styles.noteMeta, { color: theme.textHint }]}>
                    {note.mode === 'voice'
                      ? `${formatDurationFromMs(note.durationSeconds * 1000)} · ${formatTime(note.savedAt)}`
                      : `Saved ${formatTime(note.savedAt)}`}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textHint }]}>PHOTOS</Text>
          <View style={styles.photoGrid}>
            {record.activity.finalPhotos.map((photo) => (
              <View
                key={photo.id}
                style={[
                  styles.photoTile,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.borderSecondary,
                  },
                ]}
              >
                <Image resizeMode="cover" source={{ uri: photo.uri }} style={styles.photoImage} />
              </View>
            ))}
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
          disabled={isSubmitting}
          onPress={() => {
            void handleSubmitToJobber();
          }}
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: theme.actionPrimary,
              opacity: isSubmitting ? 0.72 : pressed ? 0.92 : 1,
            },
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={theme.actionText} />
          ) : (
            <Text style={[styles.submitButtonText, { color: theme.actionText }]}>
              Submit to Jobber
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function ReportRow({
  label,
  theme,
  value,
}: {
  label: string;
  theme: ThemeColors;
  value: string;
}) {
  return (
    <View style={[styles.reportRow, { borderBottomColor: theme.borderSecondary }]}>
      <Text style={[styles.reportLabel, { color: theme.textHint }]}>{label}</Text>
      <Text style={[styles.reportValue, { color: theme.textPrimary }]}>{value}</Text>
    </View>
  );
}

function formatTime(timestamp?: number) {
  if (!timestamp) {
    return 'Not recorded';
  }

  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
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
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    minWidth: 48,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.72,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginTop: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  reportRow: {
    borderBottomWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  reportLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  reportValue: {
    fontSize: 15,
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  noteRow: {
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  noteText: {
    fontSize: 15,
    lineHeight: 22,
  },
  noteMeta: {
    fontSize: 12,
    marginTop: 6,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoTile: {
    borderRadius: 20,
    borderWidth: 1,
    height: 138,
    overflow: 'hidden',
    width: '48%',
  },
  photoImage: {
    height: '100%',
    width: '100%',
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
  submitButton: {
    alignItems: 'center',
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 56,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
});
