import React from 'react';
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
import { buildReportSummary, formatDurationFromMs } from './jobData';

type RootStackParamList = {
  JobsList: undefined;
  JobDetail: { jobId: string };
  Success: { jobId: string };
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
    successBackground: '#EAF3DE',
    successMark: '#3B6D11',
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
  },
};

export default function SuccessScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<SuccessRoute>();
  const insets = useSafeAreaInsets();
  const { getRecord, records } = useJobSession();
  const colorScheme = (useColorScheme() ?? Appearance.getColorScheme() ?? 'light') as
    | 'light'
    | 'dark';
  const theme = colors[colorScheme];
  const record = getRecord(route.params.jobId);
  const nextJob = records.find(
    (item) => item.job.id !== route.params.jobId && item.job.status !== 'completed',
  );
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

  const duration =
    record.activity.startTime && record.activity.endTime
      ? record.activity.endTime - record.activity.startTime
      : 0;
  const summary = buildReportSummary(record);

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
        <Text style={[styles.headerLabel, { color: theme.textHint }]}>JOBBER</Text>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Submission complete</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 146 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.borderSecondary,
            },
          ]}
        >
          <View style={[styles.successCircle, { backgroundColor: theme.successBackground }]}>
            <View style={styles.checkWrap}>
              <View style={[styles.checkVerticalArm, { backgroundColor: theme.successMark }]} />
              <View style={[styles.checkHorizontalArm, { backgroundColor: theme.successMark }]} />
            </View>
          </View>
          <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>{record.job.siteName}</Text>
          <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
            Report submitted from the recorded work session, attached voice notes, and final site photos.
          </Text>
        </View>

        <View
          style={[
            styles.reportCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.borderSecondary,
            },
          ]}
        >
          <ReportRow
            label="START TIME"
            theme={theme}
            value={formatTime(record.activity.startTime)}
          />
          <ReportRow
            label="END TIME"
            theme={theme}
            value={formatTime(record.activity.endTime)}
          />
          <ReportRow
            label="DURATION"
            theme={theme}
            value={formatDurationFromMs(duration)}
          />
          <ReportRow label="LOCATION" theme={theme} value={record.job.address} />
        </View>

        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.borderSecondary,
            },
          ]}
        >
          <Text style={[styles.sectionLabel, { color: theme.textHint }]}>SUMMARY</Text>
          <Text style={[styles.summaryText, { color: theme.textPrimary }]}>{summary}</Text>
        </View>

        <View style={styles.photoSection}>
          <Text style={[styles.sectionLabel, { color: theme.textHint }]}>FINAL PHOTOS</Text>
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

        <View
          style={[
            styles.exportCard,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.borderSecondary,
            },
          ]}
        >
          <Text style={[styles.sectionLabel, { color: theme.textHint }]}>NEXT</Text>
          <Text style={[styles.exportText, { color: theme.textPrimary }]}>
            This report is ready for future sharing, export, or supervisor review without adding
            more work in the field.
          </Text>
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
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'JobsList' }],
            })
          }
          style={({ pressed }) => [
            styles.secondaryButton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.borderSecondary,
              opacity: pressed ? 0.92 : 1,
            },
          ]}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.textPrimary }]}>Jobs List</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            nextJob
              ? navigation.navigate('JobDetail', { jobId: nextJob.job.id })
              : navigation.reset({ index: 0, routes: [{ name: 'JobsList' }] })
          }
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: theme.actionPrimary,
              opacity: pressed ? 0.92 : 1,
            },
          ]}
        >
          <Text style={[styles.primaryButtonText, { color: theme.actionText }]}>
            {nextJob ? 'Open Next Job' : 'Back to Jobs'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function ReportRow({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: ThemeColors;
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
    hour: 'numeric',
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
    borderBottomWidth: 1,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 6,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heroCard: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
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
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
  },
  reportCard: {
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 18,
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
  summaryCard: {
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 18,
    padding: 18,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 23,
  },
  photoSection: {
    marginTop: 22,
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
  exportCard: {
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 22,
    padding: 18,
  },
  exportText: {
    fontSize: 15,
    lineHeight: 22,
  },
  ctaBar: {
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    left: 0,
    paddingHorizontal: 16,
    paddingTop: 14,
    position: 'absolute',
    right: 0,
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    marginRight: 10,
    minHeight: 54,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 16,
    flex: 1.2,
    justifyContent: 'center',
    minHeight: 54,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
