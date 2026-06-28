import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import AnalysesListScreen from '../screens/analyses/AnalysesListScreen';
import AnalysesUploadScreen from '../screens/analyses/AnalysesUploadScreen';
import AnalysisDetailScreen from '../screens/analyses/AnalysisDetailScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import DocumentsListScreen from '../screens/documents/DocumentsListScreen';
import DocumentFormScreen from '../screens/documents/DocumentFormScreen';
import DocumentDetailScreen from '../screens/documents/DocumentDetailScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ProfileScreen from '../screens/settings/ProfileScreen';

const Tab = createBottomTabNavigator();
const DashboardStack = createNativeStackNavigator();
const AnalysesStack = createNativeStackNavigator();
const DocumentsStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

function DashboardStackNavigator() {
  return (
    <DashboardStack.Navigator>
      <DashboardStack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'RentSure' }} />
    </DashboardStack.Navigator>
  );
}

function AnalysesStackNavigator() {
  return (
    <AnalysesStack.Navigator>
      <AnalysesStack.Screen name="AnalysesList" component={AnalysesListScreen} options={{ title: 'Analyses' }} />
      <AnalysesStack.Screen name="AnalysesUpload" component={AnalysesUploadScreen} options={{ title: 'Upload Lease' }} />
      <AnalysesStack.Screen name="AnalysisDetail" component={AnalysisDetailScreen} options={{ title: 'Analysis' }} />
    </AnalysesStack.Navigator>
  );
}

function DocumentsStackNavigator() {
  return (
    <DocumentsStack.Navigator>
      <DocumentsStack.Screen name="DocumentsList" component={DocumentsListScreen} options={{ title: 'Documents' }} />
      <DocumentsStack.Screen name="DocumentForm" component={DocumentFormScreen} options={{ title: 'Generate' }} />
      <DocumentsStack.Screen name="DocumentDetail" component={DocumentDetailScreen} options={{ title: 'Document' }} />
    </DocumentsStack.Navigator>
  );
}

function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen name="SettingsHome" component={SettingsScreen} options={{ title: 'Settings' }} />
      <SettingsStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </SettingsStack.Navigator>
  );
}

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackNavigator}
        options={{ title: 'Home', tabBarIcon: () => <TabIcon emoji="🏠" /> }}
      />
      <Tab.Screen
        name="AnalysesTab"
        component={AnalysesStackNavigator}
        options={{ title: 'Analyses', tabBarIcon: () => <TabIcon emoji="📄" /> }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatScreen}
        options={{ title: 'AI Chat', tabBarIcon: () => <TabIcon emoji="💬" />, headerShown: true }}
      />
      <Tab.Screen
        name="DocumentsTab"
        component={DocumentsStackNavigator}
        options={{ title: 'Documents', tabBarIcon: () => <TabIcon emoji="📝" /> }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackNavigator}
        options={{ title: 'Settings', tabBarIcon: () => <TabIcon emoji="⚙️" /> }}
      />
    </Tab.Navigator>
  );
}
