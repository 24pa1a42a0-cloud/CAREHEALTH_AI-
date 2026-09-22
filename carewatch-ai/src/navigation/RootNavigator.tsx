import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { CaregiverDashboardScreen } from '../screens/CaregiverDashboardScreen';
import { PrivacySafetyScreen } from '../screens/PrivacySafetyScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SubmitScreen } from '../screens/SubmitScreen';
import { colors } from '../theme/colors';
import { useCareWatch } from '../context/CareWatchContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { role, isAuthenticated } = useCareWatch();
  
  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      key={role}
      initialRouteName={role === 'caregiver' ? 'CaregiverDashboard' : 'MainTabs'}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{
          presentation: 'card',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="CaregiverDashboard"
        component={CaregiverDashboardScreen}
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="PrivacySafety"
        component={PrivacySafetyScreen}
        options={{
          presentation: 'card',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="Submit"
        component={SubmitScreen}
        options={{
          presentation: 'card',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
};
