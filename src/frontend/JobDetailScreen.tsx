import React from 'react';
import {
  Appearance,
  Linking,
  Platform,
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
import { JobStatus } from './jobData';

type RootStackParamList = {
  JobsList: undefined;
  JobDetail: { jobId: string };
  ActiveJob: { jobId: string };
  PhotoCapture: { jobId: string };
  Success: { jobId: string };
};

type Navigation = NativeStackNavigationProp<RootStackParamList, 'JobDetail'>;
type JobDetailRoute = RouteProp<RootStackParamList, 'JobDetail'>;

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
  accentBackground: string;
  accentText: string;
};

const BACK_BUTTON_HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

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
    linkPrimary: '#185FA5',
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
    linkPrimary: '#8CB8E8',
    accentBackground: '#EAF3DE',
    accentText: '#3B6D11',
  },
};

function getWorkflowCopy(status: JobStatus) {
  switch (status) {
    case 'in_progress':
      return {
        badge: 'Active Session',
        body: 'The timer is already running. Keep working, then finish the job when the site is ready for final photos.',
        cta: 'Resume Job',
      };
    case 'awaiting_completion_upload':
      return {
        badge: 'Ready For Proof',
        body: 'The work session is closed. Add 1 to 3 final photos and generate the simple report.',
        cta: 'Add Final Photos',
      };
    case 'completed':
      return {
        badge: 'Report Ready',
        body: 'This stop already has a completed proof-of-work report. Review the report or head to the next job.',
        cta: 'View Report',
      };
    case 'not_started':
    default:
      return {
        badge: 'One-Tap Start',
        body: 'Keep admin work out of the way. Start the job, let the timer run passively, then finish with final photos only.',
        cta: 'Start Job',
      };
  }
}

function InfoRow({
  label,
  value,
  multiline = false,
  theme,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  theme: ThemeColors;
}) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: theme.borderSecondary }]}>
      <Text style={[styles.infoLabel, { color: theme.textHint }]}>{label}</Text>
      <Text
        style={[
          styles.infoValue,
          multiline ? styles.infoValueMultiline : styles.infoValueSingleLine,
          { color: theme.textPrimary },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export default function JobDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<JobDetailRoute>();
  const insets = useSafeAreaInsets();
  const { getRecord, startJob } = useJobSession();
  const colorScheme = (useColorScheme() ?? Appearance.getColorScheme() ?? 'light') as
    | 'light'
    | 'dark';
  const theme = colors[colorScheme];
  const record = getRecord(route.params.jobId);
  const statusBarStyle = colorScheme === 'dark' ? 'light-content' : 'dark-content';

  if (!record) {
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

  const { job } = record;
  const workflowCopy = getWorkflowCopy(job.status);

  const handleCallContact = () => {
    const phoneDigits = job.phone.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${phoneDigits}`);
  };

  const handleOpenMaps = () => {
    const encodedAddress = encodeURIComponent(job.address);
    const mapsUrl =
      Platform.OS === 'ios'
        ? `maps://?q=${encodedAddress}`
        : `geo:0,0?q=${encodedAddress}`;

    Linking.openURL(mapsUrl);
  };

  const handlePrimaryAction = () => {
    if (job.status === 'in_progress') {
      navigation.navigate('ActiveJob', { jobId: job.id });
      return;
    }

    if (job.status === 'awaiting_completion_upload') {
      navigation.navigate('PhotoCapture', { jobId: job.id });
      return;
    }

    if (job.status === 'completed') {
      navigation.navigate('Success', { jobId: job.id });
      return;
    }

    startJob(job.id);
    navigation.navigate('ActiveJob', { jobId: job.id });
  };

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
          style={({ pressed }) => [styles.backButton, pressed ? styles.pressed : null]}
        >
          <Text style={[styles.backButtonText, { color: theme.linkPrimary }]}>&lt; Jobs</Text>
        </Pressable>

        <Text
          ellipsizeMode="tail"
          numberOfLines={1}
          style={[styles.navTitle, { color: theme.textPrimary }]}
        >
          {job.siteName}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 156 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.workflowCard,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.borderSecondary,
            },
          ]}
        >
          <View style={[styles.workflowBadge, { backgroundColor: theme.accentBackground }]}>
            <Text style={[styles.workflowBadgeText, { color: theme.accentText }]}>
              {workflowCopy.badge}
            </Text>
          </View>
          <Text style={[styles.workflowTitle, { color: theme.textPrimary }]}>
            Start Job {'\u2192'} Finish Job {'\u2192'} Final Photos {'\u2192'} Report
          </Text>
          <Text style={[styles.workflowBody, { color: theme.textSecondary }]}>
            {workflowCopy.body}
          </Text>
        </View>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.borderSecondary,
            },
          ]}
        >
          <InfoRow label="ADDRESS" theme={theme} value={job.address} />
          <InfoRow label="SCHEDULED WINDOW" theme={theme} value={job.timeWindow} />
          <InfoRow label="JOB TYPE" theme={theme} value={job.jobType} />
          <InfoRow label="ISSUE SUMMARY" multiline theme={theme} value={job.issue} />
          <InfoRow
            label="CONTACT"
            theme={theme}
            value={`${job.contactName} • ${job.phone}`}
          />
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
        <View style={styles.secondaryRow}>
          <Pressable
            accessibilityRole="button"
            onPress={handleCallContact}
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
              Call Contact
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={handleOpenMaps}
            style={({ pressed }) => [
              styles.secondaryButton,
              styles.secondaryButtonTrailing,
              {
                backgroundColor: theme.surface,
                borderColor: theme.borderSecondary,
                opacity: pressed ? 0.92 : 1,
              },
            ]}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.textPrimary }]}>
              Open in Maps
            </Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handlePrimaryAction}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: theme.actionPrimary,
              opacity: pressed ? 0.92 : 1,
            },
          ]}
        >
          <Text style={[styles.primaryButtonText, { color: theme.actionText }]}>
            {workflowCopy.cta}
          </Text>
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
  navBar: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    minWidth: 56,
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  navTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    marginRight: 56,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  workflowCard: {
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 18,
    padding: 18,
  },
  workflowBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  workflowBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  workflowTitle: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  workflowBody: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  infoCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoRow: {
    borderBottomWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 15,
    lineHeight: 22,
  },
  infoValueSingleLine: {
    minHeight: 20,
  },
  infoValueMultiline: {
    minHeight: 66,
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
  secondaryRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 16,
  },
  secondaryButtonTrailing: {
    marginLeft: 10,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
});
