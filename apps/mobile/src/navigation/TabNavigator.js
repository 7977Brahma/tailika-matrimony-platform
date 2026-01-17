import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { theme } from '../theme';

import DiscoveryScreen from '../screens/DiscoveryScreen';
import MatchesScreen from '../screens/MatchesScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textMuted,
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Discovery"
                component={DiscoveryScreen}
                options={{
                    tabBarLabel: 'Discover',
                    tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>🏠</span>,
                }}
            />
            <Tab.Screen
                name="Matches"
                component={MatchesScreen}
                options={{
                    tabBarLabel: 'Matches',
                    tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>💕</span>,
                }}
            />
            <Tab.Screen
                name="Messages"
                component={MessagesScreen}
                options={{
                    tabBarLabel: 'Messages',
                    tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>💬</span>,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>👤</span>,
                }}
            />
        </Tab.Navigator>
    );
}
