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

type JobStatus = 'overdue' | 'starting_soon' | 'in_progress' | 'scheduled';

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
  statusOverdueBackground: string;
  statusOverdueText: string;
  statusStartingSoonBackground: string;
  statusStartingSoonText: string;
  statusInProgressBackground: string;
  statusInProgressText: string;
  statusScheduledBackground: string;
  statusScheduledText: string;
};

const colors: Record<'light' | 'dark', ThemeColors> = {
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    textPrimary: '#111111',
    textSecondary: '#6B6B6B',
    textHint: '#AAAAAA',
    borderSecondary: 'rgba(0,0,0,0.15)',
    actionPrimary: '#0F2D54',
    actionText: '#FFFFFF',
    highlightBorder: '#185FA5',
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
    textPrimary: '#F5F5F5',
    textSecondary: '#999999',
    textHint: '#666666',
    borderSecondary: 'rgba(255,255,255,0.12)',
    actionPrimary: '#0F2D54',
    actionText: '#FFFFFF',
    highlightBorder: '#185FA5',
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

type JobsListScreenProps = {
  jobs?: Job[];
};

type JobCardProps = {
  colors: ThemeColors;
  job: Job;
  onPress: () => void;
};

type StatusBadgeProps = {
  colors: ThemeColors;
  status: JobStatus;
};

const STATUS_LABELS: Record<JobStatus, string> = {
  overdue: 'Overdue',
  starting_soon: 'Starting Soon',
  in_progress: 'In Progress',
  scheduled: 'Scheduled',
};

function StatusBadge({ colors, status }: StatusBadgeProps) {
  const badgeStyles = getStatusBadgeStyle(colors, status);

  return (
    <View style={[styles.badgeBase, badgeStyles.container]}>
      <Text style={[styles.badgeTextBase, badgeStyles.text]}>{STATUS_LABELS[status]}</Text>
    </View>
  );
}

function JobCard({ colors, job, onPress }: JobCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardBase,
        {
          backgroundColor: colors.surface,
          borderColor: job.isHighlighted ? colors.highlightBorder : colors.borderSecondary,
          borderWidth: job.isHighlighted ? 1.5 : StyleSheet.hairlineWidth,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={styles.cardHeaderRow}>
        <Text numberOfLines={1} style={[styles.siteName, { color: colors.textPrimary }]}>
          {job.siteName}
        </Text>
        <StatusBadge colors={colors} status={job.status} />
      </View>

      <Text numberOfLines={1} style={[styles.address, { color: colors.textSecondary }]}>
        {job.address}
      </Text>

      <Text style={[styles.jobMeta, { color: colors.textHint }]}>
        {job.timeWindow} {'\u2022'} {job.jobType}
      </Text>
    </Pressable>
  );
}

export default function JobsListScreen({ jobs = JOBS }: JobsListScreenProps) {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const colorScheme = (useColorScheme() ?? Appearance.getColorScheme() ?? 'light') as
    | 'light'
    | 'dark';
  const theme = colors[colorScheme];
  const nextJob =
    jobs.find((job) => job.status === 'in_progress') ??
    jobs.find((job) => job.isHighlighted) ??
    jobs[0];
  const statusBarStyle = colorScheme === 'dark' ? 'light-content' : 'dark-content';
  const ctaLabel =
    nextJob?.status === 'in_progress'
      ? `Resume Job — ${nextJob.siteName}`
      : `Start Next Job — ${nextJob?.siteName ?? ''}`;

  const handleOpenJob = (jobId: string) => {
    navigation.navigate('JobDetail', { jobId });
  };

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
      </View>

      <FlatList
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 80 + insets.bottom },
        ]}
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <JobCard colors={theme} job={item} onPress={() => handleOpenJob(item.id)} />
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
        <Pressable
          accessibilityRole="button"
          disabled={!nextJob}
          onPress={() => nextJob && handleOpenJob(nextJob.id)}
          style={({ pressed }) => [
            styles.ctaButton,
            {
              backgroundColor: theme.actionPrimary,
              opacity: pressed || !nextJob ? 0.92 : 1,
            },
          ]}
        >
          <Text style={[styles.ctaText, { color: theme.actionText }]}>{ctaLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
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
  header: {
    borderBottomWidth: 0.5,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  appLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.66,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 24,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  cardBase: {
    borderRadius: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  siteName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    marginRight: 12,
  },
  address: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  jobMeta: {
    fontSize: 12,
    lineHeight: 16,
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
  ctaBar: {
    borderTopWidth: 0.5,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  ctaButton: {
    borderRadius: 12,
    paddingVertical: 16,
    width: '100%',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
