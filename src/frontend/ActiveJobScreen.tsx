import React, { useEffect, useState } from 'react';
import {
  Appearance,
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
  zoneLabel: string;
};

type ChecklistState = {
  beforePhoto: boolean;
  issueNoted: boolean;
  afterPhoto: boolean;
};

type RootStackParamList = {
  ActiveJob: { jobId: string; startTime: number };
  VoiceNote: { jobId: string; mode?: 'text' };
  PhotoCapture: { jobId: string };
  ReviewReport: { jobId: string; startTime: number };
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
  timerSubtle: string;
  promptBackground: string;
  promptText: string;
  voiceNoteBackground: string;
  voiceNoteBorder: string;
  voiceNoteText: string;
  finishBackground: string;
  finishBorder: string;
  finishText: string;
  actionPrimary: string;
  actionText: string;
  checklistDone: string;
  checklistCheckmark: string;
  missingBackground: string;
  missingText: string;
  thumbBackground: string;
};

type SectionHeaderProps = {
  colors: ThemeColors;
  label: string;
};

type ActionButtonProps = {
  colors: ThemeColors;
  label: string;
  icon: string;
  onPress: () => void;
  variant?: 'default' | 'voice' | 'finish';
  fullWidth?: boolean;
  vertical?: boolean;
  trailing?: boolean;
};

type CheckItemProps = {
  colors: ThemeColors;
  label: string;
  done: boolean;
  missing?: boolean;
};

type FeedItemProps = {
  colors: ThemeColors;
  icon: string;
  text: string;
  time: string;
  hasThumb?: boolean;
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

const FEED_ITEMS = [
  {
    icon: '🎙',
    text: 'Voice note — "Zone 3 solenoid looks burned out, replacing now"',
    time: '10:09 AM · 0:18',
  },
  {
    icon: '▶',
    text: 'Job started',
    time: '10:07 AM',
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
    timerBackground: '#0F2D54',
    timerLabel: 'rgba(255,255,255,0.6)',
    timerText: '#FFFFFF',
    timerMeta: 'rgba(255,255,255,0.7)',
    timerSubtle: 'rgba(255,255,255,0.4)',
    promptBackground: '#FAEEDA',
    promptText: '#633806',
    voiceNoteBackground: '#E6F1FB',
    voiceNoteBorder: '#185FA5',
    voiceNoteText: '#0C447C',
    finishBackground: '#FCEBEB',
    finishBorder: '#F09595',
    finishText: '#A32D2D',
    actionPrimary: '#0F2D54',
    actionText: '#FFFFFF',
    checklistDone: '#1D9E75',
    checklistCheckmark: '#FFFFFF',
    missingBackground: '#FAEEDA',
    missingText: '#633806',
    thumbBackground: '#B5D4F4',
  },
  dark: {
    background: '#111111',
    surface: '#1C1C1E',
    surfaceSecondary: '#262629',
    textPrimary: '#F5F5F5',
    textSecondary: '#999999',
    textHint: '#666666',
    borderSecondary: 'rgba(255,255,255,0.12)',
    timerBackground: '#0F2D54',
    timerLabel: 'rgba(255,255,255,0.6)',
    timerText: '#FFFFFF',
    timerMeta: 'rgba(255,255,255,0.7)',
    timerSubtle: 'rgba(255,255,255,0.4)',
    promptBackground: '#FAEEDA',
    promptText: '#633806',
    voiceNoteBackground: '#E6F1FB',
    voiceNoteBorder: '#185FA5',
    voiceNoteText: '#0C447C',
    finishBackground: '#FCEBEB',
    finishBorder: '#F09595',
    finishText: '#A32D2D',
    actionPrimary: '#0F2D54',
    actionText: '#FFFFFF',
    checklistDone: '#1D9E75',
    checklistCheckmark: '#FFFFFF',
    missingBackground: '#FAEEDA',
    missingText: '#633806',
    thumbBackground: '#B5D4F4',
  },
};

function SectionHeader({ colors, label }: SectionHeaderProps) {
  return <Text style={[styles.sectionLabel, { color: colors.textHint }]}>{label}</Text>;
}

function ActionButton({
  colors,
  label,
  icon,
  onPress,
  variant = 'default',
  fullWidth = false,
  vertical = false,
  trailing = false,
}: ActionButtonProps) {
  const variantStyle =
    variant === 'voice'
      ? {
          backgroundColor: colors.voiceNoteBackground,
          borderColor: colors.voiceNoteBorder,
          borderWidth: 1,
          textColor: colors.voiceNoteText,
        }
      : variant === 'finish'
        ? {
            backgroundColor: colors.finishBackground,
            borderColor: colors.finishBorder,
            borderWidth: 0.5,
            textColor: colors.finishText,
          }
        : {
            backgroundColor: colors.surface,
            borderColor: colors.borderSecondary,
            borderWidth: 0.5,
            textColor: colors.textPrimary,
          };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        fullWidth ? styles.actionButtonFull : styles.actionButtonHalf,
        trailing ? styles.actionButtonTrailing : null,
        vertical ? styles.actionButtonVertical : styles.actionButtonHorizontal,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          borderWidth: variantStyle.borderWidth,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.actionIconWrap,
          vertical ? styles.actionIconWrapVertical : styles.actionIconWrapHorizontal,
        ]}
      >
        <Text style={[styles.actionIconText, { color: variantStyle.textColor }]}>{icon}</Text>
      </View>
      <Text
        style={[
          styles.actionLabel,
          vertical ? styles.actionLabelVertical : styles.actionLabelHorizontal,
          { color: variantStyle.textColor },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CheckItem({ colors, label, done, missing = false }: CheckItemProps) {
  return (
    <View style={styles.checkItemRow}>
      <View
        style={[
          styles.checkCircle,
          {
            backgroundColor: done ? colors.checklistDone : colors.background,
            borderColor: done ? colors.checklistDone : colors.borderSecondary,
          },
        ]}
      >
        {done ? (
          <View
            style={[
              styles.checkMark,
              {
                borderColor: colors.checklistCheckmark,
              },
            ]}
          />
        ) : null}
      </View>

      <Text
        style={[
          styles.checkLabel,
          {
            color: done ? colors.textSecondary : colors.textPrimary,
            textDecorationLine: done ? 'line-through' : 'none',
          },
        ]}
      >
        {label}
      </Text>

      {missing && !done ? (
        <View style={[styles.missingBadge, { backgroundColor: colors.missingBackground }]}>
          <Text style={[styles.missingBadgeText, { color: colors.missingText }]}>Missing</Text>
        </View>
      ) : null}
    </View>
  );
}

function FeedItem({ colors, icon, text, time, hasThumb = false }: FeedItemProps) {
  return (
    <View style={styles.feedItemRow}>
      <View style={[styles.feedIconWrap, { backgroundColor: colors.surfaceSecondary }]}>
        <Text style={styles.feedIconText}>{icon}</Text>
      </View>

      <View style={styles.feedBody}>
        <Text style={[styles.feedText, { color: colors.textPrimary }]}>{text}</Text>
        <Text style={[styles.feedTime, { color: colors.textHint }]}>{time}</Text>
      </View>

      {hasThumb ? (
        <View style={[styles.feedThumb, { backgroundColor: colors.thumbBackground }]} />
      ) : null}
    </View>
  );
}

export default function ActiveJobScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ActiveJobRoute>();
  const insets = useSafeAreaInsets();
  const colorScheme = (useColorScheme() ?? Appearance.getColorScheme() ?? 'light') as
    | 'light'
    | 'dark';
  const theme = colors[colorScheme];
  const job = JOBS.find((item) => item.id === route.params.jobId);
  const [elapsedSeconds, setElapsedSeconds] = useState(
    Math.max(0, Math.floor((Date.now() - route.params.startTime) / 1000)),
  );
  const [checklist] = useState<ChecklistState>({
    beforePhoto: false,
    issueNoted: true,
    afterPhoto: false,
  });
  const statusBarStyle = 'light-content';

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - route.params.startTime) / 1000);
      setElapsedSeconds(Math.max(0, elapsed));
    }, 1000);

    return () => clearInterval(timer);
  }, [route.params.startTime]);

  let promptText = 'All steps complete. Tap Finish Job when ready.';

  if (!checklist.beforePhoto) {
    promptText = 'Next step: Take a before photo to start the record.';
  } else if (!checklist.issueNoted) {
    promptText = 'Next step: Record a voice note or describe the issue.';
  } else if (!checklist.afterPhoto) {
    promptText = 'Next step: Take an after photo before finishing.';
  }

  if (!job) {
    return (
      <SafeAreaView style={[styles.notFoundScreen, { backgroundColor: theme.background }]}>
        <StatusBar
          backgroundColor={theme.background}
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          translucent={false}
        />
        <Text style={[styles.notFoundText, { color: theme.textPrimary }]}>Job not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['left', 'right']} style={[styles.screen, { backgroundColor: theme.background }]}>
      <StatusBar
        backgroundColor={theme.timerBackground}
        barStyle={statusBarStyle}
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
        <View style={styles.timerColumn}>
          <Text style={[styles.timerLabel, { color: theme.timerLabel }]}>ACTIVE</Text>
          <Text style={[styles.timerValue, { color: theme.timerText }]}>
            {formatElapsedTime(elapsedSeconds)}
          </Text>
          <Text numberOfLines={1} style={[styles.timerJobName, { color: theme.timerMeta }]}>
            {job.siteName}
          </Text>
        </View>

        <View style={styles.timerRightColumn}>
          <Text style={[styles.timerMetaText, { color: theme.timerLabel }]}>
            {job.jobType} {'\u2022'} {job.zoneLabel}
          </Text>
          <Text style={[styles.timerSubtleText, { color: theme.timerSubtle }]}>
            {formatStartTime(route.params.startTime)} start
          </Text>
        </View>
      </View>

      <View style={[styles.promptStrip, { backgroundColor: theme.promptBackground }]}>
        <Text style={[styles.promptText, { color: theme.promptText }]}>{promptText}</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 24 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionBlock}>
          <SectionHeader colors={theme} label="ACTIONS" />

          <ActionButton
            colors={theme}
            fullWidth
            icon="▮"
            label="Record voice note"
            onPress={() => navigation.navigate('VoiceNote', { jobId: job.id })}
            variant="voice"
          />

          <View style={styles.actionRow}>
            <ActionButton
              colors={theme}
              icon="▣"
              label="Take photo"
              onPress={() => navigation.navigate('PhotoCapture', { jobId: job.id })}
              vertical
            />
            <ActionButton
              colors={theme}
              icon="✎"
              label="Describe issue"
              onPress={() => navigation.navigate('VoiceNote', { jobId: job.id, mode: 'text' })}
              trailing
              vertical
            />
          </View>

          <ActionButton
            colors={theme}
            fullWidth
            icon="■"
            label="Finish job"
            onPress={() =>
              navigation.navigate('ReviewReport', {
                jobId: job.id,
                startTime: route.params.startTime,
              })
            }
            variant="finish"
          />
        </View>

        <View style={styles.sectionBlock}>
          <SectionHeader colors={theme} label="PROGRESS" />

          <CheckItem
            colors={theme}
            done={checklist.beforePhoto}
            label="Before photo captured"
            missing={!checklist.beforePhoto}
          />
          <CheckItem colors={theme} done={checklist.issueNoted} label="Issue documented" />
          <CheckItem
            colors={theme}
            done={checklist.afterPhoto}
            label="After photo captured"
            missing={!checklist.afterPhoto}
          />
        </View>

        <View style={styles.sectionBlock}>
          <SectionHeader colors={theme} label="ACTIVITY" />

          {FEED_ITEMS.map((item) => (
            <FeedItem
              colors={theme}
              icon={item.icon}
              key={`${item.time}-${item.text}`}
              text={item.text}
              time={item.time}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatElapsedTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');

  return `${minutes}:${seconds}`;
}

function formatStartTime(startTime: number) {
  return new Date(startTime).toLocaleTimeString([], {
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
    fontWeight: '400',
  },
  timerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  timerColumn: {
    flex: 1,
    marginRight: 16,
  },
  timerRightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  timerLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.66,
    marginBottom: 6,
  },
  timerValue: {
    fontSize: 32,
    fontVariant: ['tabular-nums'],
    fontWeight: '500',
    lineHeight: 36,
    marginBottom: 4,
  },
  timerJobName: {
    fontSize: 12,
    lineHeight: 16,
  },
  timerMetaText: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 4,
    textAlign: 'right',
  },
  timerSubtleText: {
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'right',
  },
  promptStrip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  promptText: {
    fontSize: 13,
    lineHeight: 18,
  },
  scrollContent: {
    paddingTop: 16,
  },
  sectionBlock: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.55,
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  actionButton: {
    borderRadius: 12,
    padding: 16,
  },
  actionButtonFull: {
    width: '100%',
  },
  actionButtonHalf: {
    flex: 1,
  },
  actionButtonTrailing: {
    marginLeft: 8,
  },
  actionButtonHorizontal: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  actionButtonVertical: {
    alignItems: 'flex-start',
    minHeight: 104,
  },
  actionIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconWrapHorizontal: {
    marginRight: 10,
  },
  actionIconWrapVertical: {
    marginBottom: 12,
  },
  actionIconText: {
    fontSize: 16,
    lineHeight: 16,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  actionLabelHorizontal: {
    flex: 1,
  },
  actionLabelVertical: {
    lineHeight: 20,
  },
  checkItemRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 10,
  },
  checkCircle: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    height: 20,
    justifyContent: 'center',
    marginRight: 10,
    width: 20,
  },
  checkMark: {
    borderBottomWidth: 2,
    borderRightWidth: 2,
    height: 9,
    transform: [{ rotate: '45deg' }],
    width: 5,
  },
  checkLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  missingBadge: {
    borderRadius: 4,
    marginLeft: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  missingBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  feedItemRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 10,
  },
  feedIconWrap: {
    alignItems: 'center',
    borderRadius: 6,
    height: 28,
    justifyContent: 'center',
    marginRight: 12,
    width: 28,
  },
  feedIconText: {
    fontSize: 14,
    lineHeight: 14,
  },
  feedBody: {
    flex: 1,
  },
  feedText: {
    fontSize: 13,
    lineHeight: 18,
  },
  feedTime: {
    fontSize: 11,
    lineHeight: 14,
    marginTop: 2,
  },
  feedThumb: {
    borderRadius: 4,
    height: 40,
    marginLeft: 12,
    width: 52,
  },
});
