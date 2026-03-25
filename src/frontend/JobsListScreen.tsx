import React from 'react';
import {
  Appearance,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useJobSession } from './JobSessionContext';
import { Job, JobStatus } from './jobData';

type RootStackParamList = {
  JobsList: undefined;
  JobDetail: { jobId: string };
};

type Navigation = NativeStackNavigationProp<RootStackParamList, 'JobsList'>;

type ThemeColors = {
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textHint: string;
  borderSecondary: string;
  actionPrimary: string;
  actionText: string;
  highlightBorder: string;
  statusDefaultBackground: string;
  statusDefaultText: string;
  statusInProgressBackground: string;
  statusInProgressText: string;
  statusAwaitingBackground: string;
  statusAwaitingText: string;
  statusCompletedBackground: string;
  statusCompletedText: string;
};

const colors: Record<'light' | 'dark', ThemeColors> = {
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    textPrimary: '#111111',
    textSecondary: '#6B6B6B',
    textHint: '#8E8E93',
    borderSecondary: 'rgba(0,0,0,0.15)',
    actionPrimary: '#0F2D54',
    actionText: '#FFFFFF',
    highlightBorder: '#185FA5',
    statusDefaultBackground: '#F1EFE8',
    statusDefaultText: '#5F5E5A',
    statusInProgressBackground: '#EAF3DE',
    statusInProgressText: '#3B6D11',
    statusAwaitingBackground: '#E6F1FB',
    statusAwaitingText: '#185FA5',
    statusCompletedBackground: '#EAF3DE',
    statusCompletedText: '#3B6D11',
  },
  dark: {
    background: '#111111',
    surface: '#1C1C1E',
    textPrimary: '#F5F5F5',
    textSecondary: '#999999',
    textHint: '#666666',
    borderSecondary: 'rgba(255,255,255,0.12)',
    actionPrimary: '#0F2D54',
    actionText: '#FFFFFF',
    highlightBorder: '#185FA5',
    statusDefaultBackground: '#2B2B2F',
    statusDefaultText: '#C6C6C9',
    statusInProgressBackground: '#EAF3DE',
    statusInProgressText: '#3B6D11',
    statusAwaitingBackground: '#E6F1FB',
    statusAwaitingText: '#185FA5',
    statusCompletedBackground: '#EAF3DE',
    statusCompletedText: '#3B6D11',
  },
};

function getStatusStyle(theme: ThemeColors, status: JobStatus) {
  switch (status) {
    case 'in_progress':
      return {
        container: {
          backgroundColor: theme.statusInProgressBackground,
        },
        text: {
          color: theme.statusInProgressText,
        },
        label: 'Active',
      };
    case 'awaiting_completion_upload':
      return {
        container: {
          backgroundColor: theme.statusAwaitingBackground,
        },
        text: {
          color: theme.statusAwaitingText,
        },
        label: 'Add Final Photos',
      };
    case 'completed':
      return {
        container: {
          backgroundColor: theme.statusCompletedBackground,
        },
        text: {
          color: theme.statusCompletedText,
        },
        label: 'Report Ready',
      };
    case 'not_started':
    default:
      return {
        container: {
          backgroundColor: theme.statusDefaultBackground,
        },
        text: {
          color: theme.statusDefaultText,
        },
        label: 'Ready',
      };
  }
}

function StatusBadge({ theme, status }: { theme: ThemeColors; status: JobStatus }) {
  const badge = getStatusStyle(theme, status);

  return (
    <View style={[styles.badgeBase, badge.container]}>
      <Text style={[styles.badgeTextBase, badge.text]}>{badge.label}</Text>
    </View>
  );
}

function JobCard({
  job,
  onPress,
  theme,
}: {
  job: Job;
  onPress: () => void;
  theme: ThemeColors;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardBase,
        {
          backgroundColor: theme.surface,
          borderColor:
            job.status === 'in_progress' || job.isHighlighted
              ? theme.highlightBorder
              : theme.borderSecondary,
          borderWidth:
            job.status === 'in_progress' || job.isHighlighted ? 1.5 : StyleSheet.hairlineWidth,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={styles.cardHeaderRow}>
        <Text numberOfLines={1} style={[styles.siteName, { color: theme.textPrimary }]}>
          {job.siteName}
        </Text>
        <StatusBadge status={job.status} theme={theme} />
      </View>

      <Text numberOfLines={1} style={[styles.address, { color: theme.textSecondary }]}>
        {job.address}
      </Text>

      <Text style={[styles.jobMeta, { color: theme.textHint }]}>
        {job.timeWindow} {'\u2022'} {job.jobType}
      </Text>
    </Pressable>
  );
}

export default function JobsListScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { records } = useJobSession();
  const colorScheme = (useColorScheme() ?? Appearance.getColorScheme() ?? 'light') as
    | 'light'
    | 'dark';
  const theme = colors[colorScheme];
  const jobs = records.map((record) => record.job);
  const activeJob = jobs.find((job) => job.status === 'in_progress');
  const awaitingUploadJob = jobs.find((job) => job.status === 'awaiting_completion_upload');
  const nextJob = activeJob ?? awaitingUploadJob ?? jobs.find((job) => job.isHighlighted) ?? jobs[0];
  const statusBarStyle = colorScheme === 'dark' ? 'light-content' : 'dark-content';
  const ctaLabel =
    nextJob?.status === 'in_progress'
      ? `Resume Job — ${nextJob.siteName}`
      : nextJob?.status === 'awaiting_completion_upload'
        ? `Add Final Photos — ${nextJob.siteName}`
        : `Start Job — ${nextJob?.siteName ?? ''}`;
  const ctaHint =
    nextJob?.status === 'in_progress'
      ? 'Passive tracking is running. Finish when the work is done.'
      : nextJob?.status === 'awaiting_completion_upload'
        ? 'The timer is closed. Add final proof-of-work photos and create the report.'
        : 'Open the next stop and start the session with one tap.';

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={statusBarStyle}
        translucent={false}
      />

      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.borderSecondary,
            paddingTop: insets.top,
          },
        ]}
      >
        <Text style={[styles.appLabel, { color: theme.textSecondary }]}>LOGSNAP</Text>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{"Today's Jobs"}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Start work quickly, let the timer run, then finish with final site photos.
        </Text>
      </View>

      <FlatList
        contentContainerStyle={[styles.listContent, { paddingBottom: 136 + insets.bottom }]}
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
            theme={theme}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

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
        <Text style={[styles.ctaHint, { color: theme.textSecondary }]}>{ctaHint}</Text>
        <Pressable
          accessibilityRole="button"
          disabled={!nextJob}
          onPress={() => nextJob && navigation.navigate('JobDetail', { jobId: nextJob.id })}
          style={({ pressed }) => [
            styles.ctaButton,
            {
              backgroundColor: theme.actionPrimary,
              opacity: nextJob ? (pressed ? 0.92 : 1) : 0.5,
            },
          ]}
        >
          <Text style={[styles.ctaButtonText, { color: theme.actionText }]}>{ctaLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  appLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  cardBase: {
    borderRadius: 22,
    marginBottom: 14,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  cardHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  siteName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    marginRight: 12,
  },
  address: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  jobMeta: {
    fontSize: 13,
    marginTop: 8,
  },
  badgeBase: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeTextBase: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  ctaBar: {
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    position: 'absolute',
    right: 0,
  },
  ctaHint: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  ctaButton: {
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 17,
  },
  ctaButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
});
