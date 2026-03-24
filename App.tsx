import 'react-native-gesture-handler';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ActiveJobScreen from './src/frontend/ActiveJobScreen';
import JobDetailScreen from './src/frontend/JobDetailScreen';
import JobsListScreen from './src/frontend/JobsListScreen';
import PhotoCaptureScreen from './src/frontend/PhotoCaptureScreen';
import ReviewReportScreen from './src/frontend/ReviewReportScreen';
import SuccessScreen from './src/frontend/SuccessScreen';
import VoiceNoteScreen from './src/frontend/VoiceNoteScreen';

type PhotoTag = 'Before' | 'During' | 'After';

type CapturedPhoto = {
  uri: string;
  tag: PhotoTag;
  timestamp: number;
};

type RootStackParamList = {
  JobsList: undefined;
  JobDetail: { jobId: string };
  ActiveJob: { jobId: string; startTime: number; newPhotos?: CapturedPhoto[] };
  VoiceNote: { jobId: string; mode?: 'voice' | 'text' };
  PhotoCapture: { jobId: string };
  ReviewReport: {
    jobId: string;
    startTime: number;
    endTime?: number;
    notes: string[];
    photos: CapturedPhoto[];
    checklistState: {
      beforePhoto: boolean;
      issueNoted: boolean;
      afterPhoto: boolean;
    };
  };
  Success: { jobId: string; duration: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          id="root-stack"
          initialRouteName="JobsList"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen component={JobsListScreen} name="JobsList" />
          <Stack.Screen component={JobDetailScreen} name="JobDetail" />
          <Stack.Screen component={ActiveJobScreen} name="ActiveJob" />
          <Stack.Screen component={VoiceNoteScreen} name="VoiceNote" />
          <Stack.Screen component={PhotoCaptureScreen} name="PhotoCapture" />
          <Stack.Screen component={ReviewReportScreen} name="ReviewReport" />
          <Stack.Screen
            component={SuccessScreen}
            name="Success"
            options={{ gestureEnabled: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
