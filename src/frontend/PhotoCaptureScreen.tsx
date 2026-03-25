import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Alert,
  Appearance,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { useJobSession } from './JobSessionContext';
import { formatDurationFromMs } from './jobData';

type RootStackParamList = {
  PhotoCapture: { jobId: string };
  ReviewReport: { jobId: string };
};

type Navigation = NativeStackNavigationProp<RootStackParamList, 'PhotoCapture'>;
type PhotoCaptureRoute = RouteProp<RootStackParamList, 'PhotoCapture'>;

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
  mutedButton: string;
  mutedButtonText: string;
};

const MAX_FINAL_PHOTOS = 3;

const colors: Record<'light' | 'dark', ThemeColors> = {
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceSecondary: '#F4F6F8',
    textPrimary: '#111111',
    textSecondary: '#6B6B6B',
    textHint: '#8E8E93',
    borderSecondary: 'rgba(0,0,0,0.12)',
    actionPrimary: '#0F2D54',
    actionText: '#FFFFFF',
    accentBackground: '#EAF3DE',
    accentText: '#3B6D11',
    mutedButton: '#EEF2F5',
    mutedButtonText: '#0F2D54',
  },
  dark: {
    background: '#111111',
    surface: '#1C1C1E',
    surfaceSecondary: '#262629',
    textPrimary: '#F5F5F5',
    textSecondary: '#9A9AA0',
    textHint: '#6B6B70',
    borderSecondary: 'rgba(255,255,255,0.12)',
    actionPrimary: '#0F2D54',
    actionText: '#FFFFFF',
    accentBackground: '#EAF3DE',
    accentText: '#3B6D11',
    mutedButton: '#262629',
    mutedButtonText: '#F5F5F5',
  },
};

export default function PhotoCaptureScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<PhotoCaptureRoute>();
  const insets = useSafeAreaInsets();
  const { addFinalPhoto, getRecord, setCompletionNote } = useJobSession();
  const colorScheme = (useColorScheme() ?? Appearance.getColorScheme() ?? 'light') as
    | 'light'
    | 'dark';
  const theme = colors[colorScheme];
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const [isGenerating, setIsGenerating] = useState(false);
  const record = getRecord(route.params.jobId);

  useEffect(() => {
    flashOpacity.setValue(0);
  }, [flashOpacity]);

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

  const handleAddPhoto = () => {
    if (record.activity.finalPhotos.length >= MAX_FINAL_PHOTOS) {
      return;
    }

    Alert.alert('Add Photo', 'Choose how to add the photo.', [
      {
        text: 'Take Photo',
        onPress: () => {
          void handlePickPhoto('camera');
        },
      },
      {
        text: 'Choose Existing',
        onPress: () => {
          void handlePickPhoto('library');
        },
      },
      {
        style: 'cancel',
        text: 'Cancel',
      },
    ]);
  };

  const handlePickPhoto = async (source: 'camera' | 'library') => {
    if (record.activity.finalPhotos.length >= MAX_FINAL_PHOTOS) {
      return;
    }

    Animated.sequence([
      Animated.timing(flashOpacity, {
        duration: 70,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(flashOpacity, {
        duration: 90,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();

    const result =
      source === 'camera'
        ? await launchCameraCapture()
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: false,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            selectionLimit: 1,
          });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    const timestamp = Date.now();
    addFinalPhoto(record.job.id, {
      id: `${timestamp}`,
      timestamp,
      uri: result.assets[0].uri,
    });
  };

  const handleGenerateReport = async () => {
    if (record.activity.finalPhotos.length === 0 || isGenerating) {
      return;
    }

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 250));
    setIsGenerating(false);
    navigation.replace('ReviewReport', { jobId: record.job.id });
  };

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
      <StatusBar
        backgroundColor={theme.background}
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
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
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.headerActionWrap, pressed ? styles.pressed : null]}
        >
          <Text style={[styles.headerAction, { color: theme.textSecondary }]}>Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Final Photos</Text>
        <View style={styles.headerActionWrap} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 + insets.bottom }]}
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
              <Text style={[styles.jobTitle, { color: theme.textPrimary }]}>
                {record.job.siteName}
              </Text>
              <Text style={[styles.jobMeta, { color: theme.textSecondary }]}>
                {record.job.timeWindow} {'\u2022'} {record.job.jobType}
              </Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: theme.accentBackground }]}>
              <Text style={[styles.statusPillText, { color: theme.accentText }]}>
                Finish Logged
              </Text>
            </View>
          </View>

          <View style={[styles.summaryRow, { borderTopColor: theme.borderSecondary }]}>
            <Text style={[styles.summaryLabel, { color: theme.textHint }]}>ADDRESS</Text>
            <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>
              {record.job.address}
            </Text>
          </View>
          <View style={[styles.summaryRow, { borderTopColor: theme.borderSecondary }]}>
            <Text style={[styles.summaryLabel, { color: theme.textHint }]}>WORK SESSION</Text>
            <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>
              {record.activity.startTime
                ? `${new Date(record.activity.startTime).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  })} - ${new Date(record.activity.endTime ?? Date.now()).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}`
                : 'Session timing unavailable'}
            </Text>
          </View>
          <View style={[styles.summaryRow, { borderTopColor: theme.borderSecondary }]}>
            <Text style={[styles.summaryLabel, { color: theme.textHint }]}>DURATION</Text>
            <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>
              {formatDurationFromMs(duration)}
            </Text>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionLabel, { color: theme.textHint }]}>PROOF OF WORK</Text>
          <Text style={[styles.helperText, { color: theme.textSecondary }]}>
            Add 1 to 3 final site photos. This is the main proof step for the MVP, so there is no
            before/during photo requirement here.
          </Text>

          <View style={styles.photoGrid}>
            {record.activity.finalPhotos.map((photo, index) => (
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
                <View style={[styles.photoBadge, { backgroundColor: theme.actionPrimary }]}>
                  <Text style={[styles.photoBadgeText, { color: theme.actionText }]}>
                    {index + 1}
                  </Text>
                </View>
              </View>
            ))}

            {record.activity.finalPhotos.length < MAX_FINAL_PHOTOS ? (
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.8}
                onPress={handleAddPhoto}
                style={[
                  styles.addPhotoTile,
                  {
                    backgroundColor: theme.surfaceSecondary,
                    borderColor: theme.borderSecondary,
                  },
                ]}
              >
                <Animated.View
                  pointerEvents="none"
                  style={[styles.flashOverlay, { opacity: flashOpacity }]}
                />
                <Text style={[styles.addPhotoIcon, { color: theme.actionPrimary }]}>+</Text>
                <Text style={[styles.addPhotoText, { color: theme.textPrimary }]}>Add Photo</Text>
                <Text style={[styles.addPhotoSubtext, { color: theme.textSecondary }]}>
                  {`${MAX_FINAL_PHOTOS - record.activity.finalPhotos.length} remaining`}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionLabel, { color: theme.textHint }]}>OPTIONAL NOTE</Text>
          <View
            style={[
              styles.notesCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.borderSecondary,
              },
            ]}
          >
            <TextInput
              multiline
              onChangeText={(value) => setCompletionNote(record.job.id, value)}
              placeholder="Anything worth flagging before the report is generated?"
              placeholderTextColor={theme.textHint}
              style={[styles.notesInput, { color: theme.textPrimary }]}
              textAlignVertical="top"
              value={record.activity.completionNote}
            />
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
          disabled={record.activity.finalPhotos.length === 0 || isGenerating}
          onPress={() => {
            void handleGenerateReport();
          }}
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: theme.actionPrimary,
              opacity:
                record.activity.finalPhotos.length === 0 || isGenerating
                  ? 0.45
                  : pressed
                    ? 0.92
                    : 1,
            },
          ]}
        >
          <Text style={[styles.submitButtonText, { color: theme.actionText }]}>
            {isGenerating ? 'Generating Report…' : 'Generate Report'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={handleAddPhoto}
          style={({ pressed }) => [
            styles.secondaryButton,
            {
              backgroundColor: theme.mutedButton,
              opacity:
                record.activity.finalPhotos.length >= MAX_FINAL_PHOTOS
                  ? 0.45
                  : pressed
                    ? 0.92
                    : 1,
            },
          ]}
          disabled={record.activity.finalPhotos.length >= MAX_FINAL_PHOTOS}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.mutedButtonText }]}>
            Add Another Photo
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

async function launchCameraCapture() {
  const permission = await ImagePicker.requestCameraPermissionsAsync();

  if (permission.status !== 'granted') {
    Alert.alert('Camera Access Required', 'Allow camera access to take a photo for this job.');

    return {
      assets: null,
      canceled: true,
    } as ImagePicker.ImagePickerResult;
  }

  return ImagePicker.launchCameraAsync({
    allowsEditing: false,
    cameraType: ImagePicker.CameraType.back,
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
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
  headerActionWrap: {
    minWidth: 48,
  },
  headerAction: {
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
  jobTitle: {
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
  summaryRow: {
    borderTopWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  summaryValue: {
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
  helperText: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
    paddingHorizontal: 4,
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
    position: 'relative',
    width: '48%',
  },
  photoImage: {
    height: '100%',
    width: '100%',
  },
  photoBadge: {
    alignItems: 'center',
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: 10,
    top: 10,
    width: 28,
  },
  photoBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  addPhotoTile: {
    alignItems: 'center',
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 138,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '48%',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
  addPhotoIcon: {
    fontSize: 30,
    fontWeight: '300',
    lineHeight: 34,
  },
  addPhotoText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  addPhotoSubtext: {
    fontSize: 12,
    marginTop: 6,
  },
  notesCard: {
    borderRadius: 22,
    borderWidth: 1,
    minHeight: 132,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  notesInput: {
    fontSize: 15,
    lineHeight: 22,
    minHeight: 100,
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
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 50,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
