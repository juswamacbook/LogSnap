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
};

type RootStackParamList = {
  JobsList: undefined;
  JobDetail: { jobId: string };
  ActiveJob: { jobId: string; startTime: number };
};

type Navigation = NativeStackNavigationProp<RootStackParamList, 'JobDetail'>;
type JobDetailRoute = RouteProp<RootStackParamList, 'JobDetail'>;

type ThemeColors = {
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textHint: string;
  borderSecondary: string;
  actionPrimary: string;
  actionText: string;
  linkPrimary: string;
};

const BACK_BUTTON_HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

type InfoRowProps = {
  label: string;
  value: string;
  multiline?: boolean;
  colors: ThemeColors;
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
    linkPrimary: '#185FA5',
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
    linkPrimary: '#185FA5',
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
    contactName: 'Ron Fielding',
    phone: '(416) 555-0188',
    issue:
      'Zone 3 not activating. Possible solenoid failure or broken line near south bed.',
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
  },
];

function InfoRow({ label, value, multiline = false, colors }: InfoRowProps) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.borderSecondary }]}>
      <Text style={[styles.infoLabel, { color: colors.textHint }]}>{label}</Text>
      <Text
        style={[
          styles.infoValue,
          multiline ? styles.infoValueMultiline : styles.infoValueSingleLine,
          { color: colors.textPrimary },
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
  const colorScheme = (useColorScheme() ?? Appearance.getColorScheme() ?? 'light') as
    | 'light'
    | 'dark';
  const theme = colors[colorScheme];
  const job = JOBS.find((item) => item.id === route.params.jobId);
  const statusBarStyle = colorScheme === 'dark' ? 'light-content' : 'dark-content';

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

  const handleStartJob = () => {
    navigation.navigate('ActiveJob', { jobId: job.id, startTime: Date.now() });
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
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 140 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <InfoRow colors={theme} label="ADDRESS" value={job.address} />
        <InfoRow colors={theme} label="SCHEDULED WINDOW" value={job.timeWindow} />
        <InfoRow colors={theme} label="JOB TYPE" value={job.jobType} />
        <InfoRow colors={theme} label="ISSUE SUMMARY" multiline value={job.issue} />
        <InfoRow
          colors={theme}
          label="CONTACT"
          value={`${job.contactName} • ${job.phone}`}
        />
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
          onPress={handleStartJob}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: theme.actionPrimary,
              opacity: pressed ? 0.92 : 1,
            },
          ]}
        >
          <Text style={[styles.primaryButtonText, { color: theme.actionText }]}>
            Start Job
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
    fontWeight: '400',
  },
  navBar: {
    borderBottomWidth: 0.5,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '400',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 24,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  infoRow: {
    borderBottomWidth: 0.5,
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.55,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '400',
  },
  infoValueSingleLine: {
    lineHeight: 20,
  },
  infoValueMultiline: {
    lineHeight: 22,
  },
  ctaBar: {
    borderTopWidth: 0.5,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  secondaryRow: {
    flexDirection: 'row',
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 0.5,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  secondaryButtonTrailing: {
    marginLeft: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    borderRadius: 12,
    marginTop: 8,
    paddingVertical: 16,
    width: '100%',
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
