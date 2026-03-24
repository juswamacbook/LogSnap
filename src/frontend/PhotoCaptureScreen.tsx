import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

type PhotoTag = 'Before' | 'During' | 'After';

type CapturedPhoto = {
  uri: string;
  tag: PhotoTag;
  timestamp: number;
};

type RootStackParamList = {
  ActiveJob: { jobId: string; startTime?: number; newPhotos?: CapturedPhoto[] };
  PhotoCapture: { jobId: string };
};

type Navigation = NativeStackNavigationProp<RootStackParamList, 'PhotoCapture'>;
type PhotoCaptureRoute = RouteProp<RootStackParamList, 'PhotoCapture'>;

type VisionCameraModule = {
  Camera: any;
  useCameraDevice?: (position: 'back' | 'front') => any;
};

type LegacyCameraModule = {
  RNCamera: any;
  Constants?: {
    Type?: {
      back?: string;
    };
  };
};

const SCREEN_BACKGROUND = '#111111';
const HEADER_BORDER = 'rgba(255,255,255,0.1)';
const MUTED_TEXT = 'rgba(255,255,255,0.7)';
const BRACKET_COLOR = 'rgba(255,255,255,0.85)';
const FLASH_COLOR = '#FFFFFF';
const TAG_COLORS: Record<PhotoTag, string> = {
  Before: '#378ADD',
  During: '#1D9E75',
  After: '#D85A30',
};
const TAGS: PhotoTag[] = ['Before', 'During', 'After'];
const VISION_CAMERA = safeRequire('react-native-vision-camera') as VisionCameraModule | null;
const LEGACY_CAMERA = safeRequire('react-native-camera') as LegacyCameraModule | null;

export default function PhotoCaptureScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<PhotoCaptureRoute>();
  const cameraRef = useRef<any>(null);
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const [cameraAllowed, setCameraAllowed] = useState<boolean | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [activeTag, setActiveTag] = useState<PhotoTag>('Before');
  const backDevice = VISION_CAMERA?.useCameraDevice?.('back') ?? null;

  useEffect(() => {
    let mounted = true;

    const requestPermission = async () => {
      const granted = await requestCameraAccess();

      if (mounted) {
        setCameraAllowed(granted);
      }
    };

    void requestPermission();

    return () => {
      mounted = false;
    };
  }, []);

  const handleCapturePhoto = async () => {
    Animated.sequence([
      Animated.timing(flashOpacity, {
        duration: 75,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(flashOpacity, {
        duration: 75,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();

    const uri = await takePhoto(cameraRef.current);

    if (!uri) {
      return;
    }

    setCapturedPhotos((current) => [
      ...current,
      {
        tag: activeTag,
        timestamp: Date.now(),
        uri,
      },
    ]);
    setActiveTag(getNextTag(activeTag));
  };

  const handleDone = () => {
    navigation.navigate('ActiveJob', {
      jobId: route.params.jobId,
      newPhotos: capturedPhotos,
    });
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.screen, { backgroundColor: SCREEN_BACKGROUND }]}
    >
      <StatusBar hidden />

      <View
        style={[
          styles.header,
          {
            borderBottomColor: HEADER_BORDER,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.headerSide, pressed ? styles.pressed : null]}
        >
          <Text style={styles.headerAction}>Cancel</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Photo</Text>

        <View style={styles.headerSide} />
      </View>

      <View style={styles.viewfinderShell}>
        {cameraAllowed === false ? (
          <View style={styles.permissionFallback}>
            <Text style={styles.permissionText}>Camera access required</Text>
          </View>
        ) : (
          <>
            <View style={styles.viewfinder}>
              <CameraView cameraRef={cameraRef} device={backDevice} />
              <CornerBrackets />
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.flashOverlay,
                  {
                    opacity: flashOpacity,
                  },
                ]}
              />
            </View>
          </>
        )}
      </View>

      <View style={styles.tagSelector}>
        {TAGS.map((tag, index) => {
          const selected = tag === activeTag;

          return (
            <Pressable
              accessibilityRole="button"
              key={tag}
              onPress={() => setActiveTag(tag)}
              style={({ pressed }) => [
                styles.tagPill,
                index > 0 ? styles.tagPillTrailing : null,
                selected ? styles.tagPillSelected : null,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={[styles.tagText, selected ? styles.tagTextSelected : null]}>{tag}</Text>
            </Pressable>
          );
        })}
      </View>

      <View
        style={[
          styles.captureBar,
          styles.captureBarPadding,
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.thumbnailScrollContent}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailStrip}
        >
          {capturedPhotos.map((photo, index) => {
            const isLast = index === capturedPhotos.length - 1;

            return (
              <View
                key={`${photo.uri}-${photo.timestamp}`}
                style={[
                  styles.thumbnail,
                  index > 0 ? styles.thumbnailTrailing : null,
                  {
                    backgroundColor: TAG_COLORS[photo.tag],
                    borderColor: isLast ? '#FFFFFF' : 'transparent',
                  },
                ]}
              >
                {photo.uri.startsWith('file://') || photo.uri.startsWith('content://') ? (
                  <Image source={{ uri: photo.uri }} style={styles.thumbnailImage} />
                ) : (
                  <View style={styles.thumbnailFallback}>
                    <Text style={styles.thumbnailFallbackText}>{photo.tag}</Text>
                  </View>
                )}
                <View style={styles.thumbnailLabel}>
                  <Text style={styles.thumbnailLabelText}>{photo.tag.slice(0, 3).toUpperCase()}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.7}
          onPress={() => {
            void handleCapturePhoto();
          }}
          style={styles.shutterOuter}
        >
          <View style={styles.shutterInner} />
        </TouchableOpacity>

        <Pressable
          accessibilityRole="button"
          onPress={handleDone}
          style={({ pressed }) => [styles.doneButton, pressed ? styles.pressed : null]}
        >
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function CameraView({
  cameraRef,
  device,
}: {
  cameraRef: React.RefObject<any>;
  device: any;
}) {
  if (VISION_CAMERA?.Camera && device) {
    const VisionCameraComponent = VISION_CAMERA.Camera;

    return (
      <VisionCameraComponent
        device={device}
        isActive
        photo
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
      />
    );
  }

  if (LEGACY_CAMERA?.RNCamera) {
    const LegacyCameraComponent = LEGACY_CAMERA.RNCamera;

    return (
      <LegacyCameraComponent
        captureAudio={false}
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        type={LEGACY_CAMERA.Constants?.Type?.back ?? 'back'}
      />
    );
  }

  return (
    <View style={styles.permissionFallback}>
      <Text style={styles.permissionText}>Camera unavailable in this environment</Text>
    </View>
  );
}

function CornerBrackets() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <BracketCorner position="topLeft" />
      <BracketCorner position="topRight" />
      <BracketCorner position="bottomLeft" />
      <BracketCorner position="bottomRight" />
    </View>
  );
}

function BracketCorner({
  position,
}: {
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}) {
  const isTop = position.includes('top');
  const isLeft = position.includes('Left');

  return (
    <View
      style={[
        styles.bracketCorner,
        isTop ? styles.cornerTop : styles.cornerBottom,
        isLeft ? styles.cornerLeft : styles.cornerRight,
      ]}
    >
      <View
        style={[
          styles.bracketArmHorizontal,
          isTop ? styles.bracketArmTop : styles.bracketArmBottom,
        ]}
      />
      <View
        style={[
          styles.bracketArmVertical,
          isLeft ? styles.bracketArmLeft : styles.bracketArmRight,
        ]}
      />
    </View>
  );
}

async function requestCameraAccess() {
  if (VISION_CAMERA?.Camera?.requestCameraPermission) {
    const status = await VISION_CAMERA.Camera.requestCameraPermission();
    return status === 'granted';
  }

  if (Platform.OS === 'android') {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );

    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  return true;
}

async function takePhoto(cameraInstance: any) {
  if (VISION_CAMERA?.Camera && cameraInstance?.takePhoto) {
    const photo = await cameraInstance.takePhoto({ flash: 'off' });
    return photo?.path ? ensureFileUri(photo.path) : null;
  }

  if (LEGACY_CAMERA?.RNCamera && cameraInstance?.takePictureAsync) {
    const photo = await cameraInstance.takePictureAsync();
    return photo?.uri ?? null;
  }

  return `mock://capture-${Date.now()}.jpg`;
}

function getNextTag(currentTag: PhotoTag): PhotoTag {
  const currentIndex = TAGS.indexOf(currentTag);
  return TAGS[(currentIndex + 1) % TAGS.length];
}

function ensureFileUri(path: string) {
  if (path.startsWith('file://') || path.startsWith('content://')) {
    return path;
  }

  return `file://${path}`;
}

function safeRequire(moduleName: string) {
  try {
    return require(moduleName);
  } catch {
    return null;
  }
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: SCREEN_BACKGROUND,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: SCREEN_BACKGROUND,
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerSide: {
    minWidth: 56,
  },
  headerAction: {
    color: MUTED_TEXT,
    fontSize: 13,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  viewfinderShell: {
    flex: 1,
  },
  viewfinder: {
    backgroundColor: SCREEN_BACKGROUND,
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  permissionFallback: {
    alignItems: 'center',
    backgroundColor: SCREEN_BACKGROUND,
    flex: 1,
    justifyContent: 'center',
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: FLASH_COLOR,
  },
  bracketCorner: {
    height: 18,
    position: 'absolute',
    width: 18,
  },
  cornerTop: {
    top: 0,
  },
  cornerBottom: {
    bottom: 0,
  },
  cornerLeft: {
    left: 0,
  },
  cornerRight: {
    right: 0,
  },
  bracketArmHorizontal: {
    backgroundColor: BRACKET_COLOR,
    height: 2,
    position: 'absolute',
    width: 18,
  },
  bracketArmVertical: {
    backgroundColor: BRACKET_COLOR,
    height: 18,
    position: 'absolute',
    width: 2,
  },
  bracketArmTop: {
    top: 0,
  },
  bracketArmBottom: {
    bottom: 0,
  },
  bracketArmLeft: {
    left: 0,
  },
  bracketArmRight: {
    right: 0,
  },
  tagSelector: {
    alignItems: 'center',
    backgroundColor: SCREEN_BACKGROUND,
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  tagPill: {
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  tagPillTrailing: {
    marginLeft: 8,
  },
  tagPillSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  tagText: {
    color: MUTED_TEXT,
    fontSize: 12,
  },
  tagTextSelected: {
    color: SCREEN_BACKGROUND,
  },
  captureBar: {
    alignItems: 'center',
    backgroundColor: SCREEN_BACKGROUND,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  captureBarPadding: {
    paddingBottom: 12,
  },
  thumbnailStrip: {
    maxWidth: 140,
  },
  thumbnailScrollContent: {
    alignItems: 'center',
  },
  thumbnail: {
    borderColor: 'transparent',
    borderRadius: 4,
    borderWidth: 1.5,
    height: 40,
    overflow: 'hidden',
    width: 52,
  },
  thumbnailTrailing: {
    marginLeft: 8,
  },
  thumbnailImage: {
    height: '100%',
    width: '100%',
  },
  thumbnailFallback: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  thumbnailFallbackText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  thumbnailLabel: {
    backgroundColor: 'rgba(0,0,0,0.24)',
    borderRadius: 3,
    bottom: 2,
    left: 2,
    paddingHorizontal: 2,
    position: 'absolute',
    paddingVertical: 1,
  },
  thumbnailLabelText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '500',
  },
  shutterOuter: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: '#FFFFFF',
    borderRadius: 34,
    borderWidth: 3,
    height: 68,
    justifyContent: 'center',
    width: 68,
  },
  shutterInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    height: 52,
    width: 52,
  },
  doneButton: {
    alignItems: 'flex-end',
    minWidth: 52,
    paddingHorizontal: 12,
  },
  doneText: {
    color: MUTED_TEXT,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.82,
  },
});
