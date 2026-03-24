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

type JobStatus = 'overdue' | 'starting_soon' | 'in_progress' | 'scheduled';
type PhotoTag = 'Before' | 'During' | 'After';

type CapturedPhoto = {
  uri: string;
  tag: PhotoTag;
  timestamp: number;
};

type ChecklistState = {
  beforePhoto: boolean;
  issueNoted: boolean;
  afterPhoto: boolean;
};

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

type RootStackParamList = {
  ActiveJob: { jobId: string; startTime?: number; newPhotos?: CapturedPhoto[] };
  ReviewReport: {
    jobId: string;
    startTime: number;
    endTime?: number;
    notes: string[];
    photos: CapturedPhoto[];
    checklistState: ChecklistState;
  };
  Success: { jobId: string; duration: number };
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
  linkPrimary: string;
  badgeBackground: string;
  badgeText: string;
  warningBackground: string;
  warningText: string;
  missingPhotoBorder: string;
  missingPhotoBackground: string;
  missingPhotoText: string;
  photoBadgeBackground: string;
  photoBadgeText: string;
};

type ReportRowProps = {
  colors: ThemeColors;
  label: string;
  value: string;
};

type PhotoTileProps = {
  photo: CapturedPhoto | null;
  label: PhotoTag;
  isMissing: boolean;
  colors: ThemeColors;
};

const BACK_BUTTON_HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };
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

const PHOTO_TAGS: PhotoTag[] = ['Before', 'During', 'After'];

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
    badgeBackground: '#EAF3DE',
    badgeText: '#3B6D11',
    warningBackground: '#FAEEDA',
    warningText: '#633806',
    missingPhotoBorder: '#EF9F27',
    missingPhotoBackground: '#FAEEDA',
    missingPhotoText: '#854F0B',
    photoBadgeBackground: 'rgba(0,0,0,0.45)',
    photoBadgeText: '#FFFFFF',
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
    badgeBackground: '#EAF3DE',
    badgeText: '#3B6D11',
    warningBackground: '#FAEEDA',
    warningText: '#633806',
    missingPhotoBorder: '#EF9F27',
    missingPhotoBackground: '#FAEEDA',
    missingPhotoText: '#854F0B',
    photoBadgeBackground: 'rgba(0,0,0,0.45)',
    photoBadgeText: '#FFFFFF',
  },
};

function ReportRow({ colors, label, value }: ReportRowProps) {
  return (
    <View style={[styles.reportRow, { borderBottomColor: colors.borderSecondary }]}>
      <Text style={[styles.reportLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.reportValue, { color: colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

function PhotoTile({ photo, label, isMissing, colors }: PhotoTileProps) {
  if (isMissing) {
    return (
      <View
        style={[
          styles.photoTile,
          styles.photoTileMissing,
          {
            backgroundColor: colors.missingPhotoBackground,
            borderColor: colors.missingPhotoBorder,
          },
        ]}
      >
        <Text style={[styles.photoTileMissingText, { color: colors.missingPhotoText }]}>
          + {label}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.photoTile}>
      {photo?.uri ? (
        <Image resizeMode="cover" source={{ uri: photo.uri }} style={styles.photoImage} />
      ) : (
        <View style={[styles.photoFallback, { backgroundColor: colors.surfaceSecondary }]}>
          <Text style={[styles.photoFallbackText, { color: colors.textSecondary }]}>{label}</Text>
        </View>
      )}
      <View style={[styles.photoBadge, { backgroundColor: colors.photoBadgeBackground }]}>
        <Text style={[styles.photoBadgeText, { color: colors.photoBadgeText }]}>
          {label.slice(0, 3).toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

export default function ReviewReportScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ReviewReportRoute>();
  const insets = useSafeAreaInsets();
  const colorScheme = (useColorScheme() ?? Appearance.getColorScheme() ?? 'light') as
    | 'light'
    | 'dark';
  const theme = colors[colorScheme];
  const job = JOBS.find((item) => item.id === route.params.jobId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const endTime = route.params.endTime ?? Date.now();
  const statusBarStyle = colorScheme === 'dark' ? 'light-content' : 'dark-content';
  const missingItems: string[] = [];

  if (!route.params.checklistState.beforePhoto) {
    missingItems.push('before photo');
  }
  if (!route.params.checklistState.issueNoted) {
    missingItems.push('issue note');
  }
  if (!route.params.checklistState.afterPhoto) {
    missingItems.push('after photo');
  }

  const handleSubmitToJobber = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSubmitting(false);
    navigation.navigate('Success', {
      duration: endTime - route.params.startTime,
      jobId: route.params.jobId,
    });
  };

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
          style={({ pressed }) => [styles.backButton, pressed ? styles.pressed : null]}
        >
          <Text style={[styles.backButtonText, { color: theme.linkPrimary }]}>&lt; Active Job</Text>
        </Pressable>

        <Text style={[styles.navTitle, { color: theme.textPrimary }]}>Review report</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 120 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.autoBadge, { backgroundColor: theme.badgeBackground }]}>
          <Text style={[styles.autoBadgeText, { color: theme.badgeText }]}>
            Auto-generated from captured activity
          </Text>
        </View>

        {missingItems.length > 0 ? (
          <View style={[styles.missingAlert, { backgroundColor: theme.warningBackground }]}>
            <Text style={[styles.missingAlertText, { color: theme.warningText }]}>
              {`Missing: ${missingItems.join(', ')}. Add before submitting.`}
            </Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textHint }]}>Job summary</Text>
          <View style={[styles.sectionBody, { backgroundColor: theme.surface }]}>
            <ReportRow colors={theme} label="Site" value={job.siteName} />
            <ReportRow colors={theme} label="Start" value={formatTime(route.params.startTime)} />
            <ReportRow colors={theme} label="End" value={formatTime(endTime)} />
            <ReportRow
              colors={theme}
              label="Duration"
              value={formatDuration(endTime - route.params.startTime)}
            />
            <ReportRow colors={theme} label="Outcome" value="Completed" />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionLabel, { color: theme.textHint }]}>Notes</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => console.warn('Edit notes: not yet implemented')}
              style={({ pressed }) => [pressed ? styles.pressed : null]}
            >
              <Text style={[styles.editLink, { color: theme.linkPrimary }]}>Edit</Text>
            </Pressable>
          </View>

          {route.params.notes.length === 0 ? (
            <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
              No notes captured.
            </Text>
          ) : (
            route.params.notes.map((note, index) => (
              <Text
                key={`${note}-${index}`}
                style={[
                  styles.noteText,
                  {
                    borderBottomColor: theme.borderSecondary,
                    color: theme.textPrimary,
                  },
                ]}
              >
                {`· ${note}`}
              </Text>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textHint }]}>
            {`Photos (${route.params.photos.length})`}
          </Text>

          <View style={styles.photoGrid}>
            {PHOTO_TAGS.map((tag, index) => {
              const matchedPhoto =
                [...route.params.photos]
                  .reverse()
                  .find((photo) => photo.tag === tag) ?? null;

              return (
                <View
                  key={tag}
                  style={[styles.photoTileWrap, index > 0 ? styles.photoTileWrapGap : null]}
                >
                  <PhotoTile
                    colors={theme}
                    isMissing={!matchedPhoto}
                    label={tag}
                    photo={matchedPhoto}
                  />
                </View>
              );
            })}
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
              opacity: isSubmitting ? 0.8 : pressed ? 0.92 : 1,
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

function formatTime(ms: number) {
  return new Date(ms).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(ms: number) {
  return `${Math.round(ms / 60000)} min`;
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
    paddingTop: 12,
  },
  autoBadge: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  autoBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  missingAlert: {
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  missingAlertText: {
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.55,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionBody: {
    width: '100%',
  },
  reportRow: {
    alignItems: 'center',
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  reportLabel: {
    fontSize: 13,
  },
  reportValue: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 16,
    textAlign: 'right',
  },
  editLink: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyStateText: {
    fontSize: 13,
    lineHeight: 18,
  },
  noteText: {
    borderBottomWidth: 0.5,
    fontSize: 13,
    lineHeight: 18,
    paddingVertical: 8,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  photoTileWrap: {
    marginBottom: 8,
  },
  photoTileWrapGap: {
    marginLeft: 8,
  },
  photoTile: {
    borderRadius: 6,
    height: 60,
    overflow: 'hidden',
    width: 80,
  },
  photoTileMissing: {
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    justifyContent: 'center',
  },
  photoTileMissingText: {
    fontSize: 11,
    fontWeight: '500',
  },
  photoImage: {
    height: '100%',
    width: '100%',
  },
  photoFallback: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  photoFallbackText: {
    fontSize: 11,
    fontWeight: '500',
  },
  photoBadge: {
    borderRadius: 3,
    bottom: 4,
    left: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    position: 'absolute',
  },
  photoBadgeText: {
    fontSize: 9,
    fontWeight: '500',
  },
  ctaBar: {
    borderTopWidth: 0.5,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  submitButton: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    paddingVertical: 16,
    width: '100%',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.92,
  },
});
