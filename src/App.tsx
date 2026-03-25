import 'react-native-gesture-handler';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ActiveJobScreen from './frontend/ActiveJobScreen';
import { JobSessionProvider } from './frontend/JobSessionContext';
import JobDetailScreen from './frontend/JobDetailScreen';
import JobsListScreen from './frontend/JobsListScreen';
import PhotoCaptureScreen from './frontend/PhotoCaptureScreen';
import ReviewReportScreen from './frontend/ReviewReportScreen';
import SuccessScreen from './frontend/SuccessScreen';
import VoiceNoteScreen from './frontend/VoiceNoteScreen';

type RootStackParamList = {
  JobsList: undefined;
  JobDetail: { jobId: string };
  ActiveJob: { jobId: string };
  VoiceNote: { jobId: string; mode?: 'voice' | 'text' };
  PhotoCapture: { jobId: string };
  ReviewReport: { jobId: string };
  Success: { jobId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <JobSessionProvider>
        <NavigationContainer>
          <Stack.Navigator
            id="root-stack"
            initialRouteName="JobsList"
            screenOptions={{ headerShown: false }}
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
      </JobSessionProvider>
    </SafeAreaProvider>
  );
}
