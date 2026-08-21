import {
  History as HistoryIcon,
  MapPin,
  Settings as SettingsIcon,
  Shield,
  Users,
} from 'lucide-react-native';
import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

export type ApprovedTabKey = 'home' | 'contacts' | 'places' | 'history' | 'settings';

export interface ApprovedTabBarProps {
  currentTab: ApprovedTabKey;
  onSelectTab: (tab: ApprovedTabKey) => void;
  isDarkMode?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

interface TabItemConfig {
  key: ApprovedTabKey;
  label: string;
  icon: typeof Shield;
}

const TABS: TabItemConfig[] = [
  { key: 'home', label: 'Início', icon: Shield },
  { key: 'contacts', label: 'Contatos', icon: Users },
  { key: 'places', label: 'Locais', icon: MapPin },
  { key: 'history', label: 'Histórico', icon: HistoryIcon },
  { key: 'settings', label: 'Ajustes', icon: SettingsIcon },
];

export const ApprovedTabBar: React.FC<ApprovedTabBarProps> = ({
  currentTab,
  onSelectTab,
  isDarkMode = false,
  style,
  testID = 'approved-tabbar',
}) => {
  return (
    <View
      style={[
        styles.container,
        isDarkMode ? styles.darkContainer : styles.lightContainer,
        style,
      ]}
      testID={testID}
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.key;

        const activeColor = '#1565C0';
        const inactiveColor = isDarkMode ? '#94A3B8' : '#64748B';
        const color = isActive ? activeColor : inactiveColor;

        return (
          <Pressable
            key={tab.key}
            accessibilityLabel={tab.label}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onSelectTab(tab.key)}
            style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}
            testID={`${testID}-tab-${tab.key}`}
          >
            <Icon size={20} color={color} strokeWidth={isActive ? 2.5 : 1.8} />
            <Text
              style={[
                styles.tabLabel,
                { color },
                isActive && styles.activeTabLabel,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderTopWidth: 1,
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    width: '100%',
  },
  lightContainer: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#F1F5F9',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  darkContainer: {
    backgroundColor: '#0A1128',
    borderTopColor: 'rgba(30, 58, 138, 0.4)',
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  activeTabLabel: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
