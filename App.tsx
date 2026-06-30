import { Component, type ReactNode } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors, useScheme, AppBackground } from './src/theme';
import { AppProvider, useSettings } from './src/store/settings';
import { DesignThemeProvider } from './safa-shared/JLPT-Listening/design';
import { useT } from './src/i18n';
import HomeScreen from './src/screens/HomeScreen';
import DictScreen from './src/screens/DictScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ContentScreen from './src/screens/ContentScreen';

// 短文/長文タブ（共通 ContentScreen をタブ別に薄くラップ）
function ShortTab() {
  const t = useT();
  return <ContentScreen tab="短文" kicker={t.shortKicker} title={t.shortTitle} sub={t.shortSub} />;
}
function LongTab() {
  const t = useT();
  return <ContentScreen tab="長文" kicker={t.longKicker} title={t.longTitle} sub={t.longSub} />;
}

// 本番(Release)はエラー画面(赤box)が出ず白画面になるため、起動時例外を画面に表示する保険。
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 24, paddingTop: 64 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#dc2626', marginBottom: 8 }}>起動エラー</Text>
          <Text style={{ fontSize: 13, color: '#0f172a' }}>{String(this.state.error?.message || this.state.error)}</Text>
          <Text style={{ fontSize: 11, color: '#64748b', marginTop: 12 }}>{String(this.state.error?.stack || '').slice(0, 1500)}</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const Tab = createMaterialTopTabNavigator();

type IoniconName = keyof typeof Ionicons.glyphMap;
type TabLabelKey = 'tabHome' | 'tabShort' | 'tabLong' | 'tabDict' | 'tabSettings';
const TABS: { name: string; labelKey: TabLabelKey; component: React.ComponentType; icon: IoniconName; iconOff: IoniconName }[] = [
  { name: 'Home', labelKey: 'tabHome', component: HomeScreen, icon: 'home', iconOff: 'home-outline' },
  { name: 'Short', labelKey: 'tabShort', component: ShortTab, icon: 'chatbubble', iconOff: 'chatbubble-outline' },
  { name: 'Long', labelKey: 'tabLong', component: LongTab, icon: 'headset', iconOff: 'headset-outline' },
  { name: 'Dictionary', labelKey: 'tabDict', component: DictScreen, icon: 'search', iconOff: 'search-outline' },
  { name: 'Settings', labelKey: 'tabSettings', component: SettingsScreen, icon: 'settings', iconOff: 'settings-outline' },
];

function MainTabs() {
  const c = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      screenOptions={{
        lazy: true,
        swipeEnabled: true,
        tabBarActiveTintColor: c.blue,
        tabBarInactiveTintColor: c.faint,
        tabBarShowIcon: true,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', textTransform: 'none', margin: 0 },
        tabBarItemStyle: { flexDirection: 'column', paddingTop: 6, paddingBottom: 2 },
        tabBarStyle: { backgroundColor: c.surface, paddingBottom: insets.bottom, elevation: 0, shadowOpacity: 0, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.line },
        tabBarIndicatorStyle: { backgroundColor: c.blue, height: 2, top: 0 },
        tabBarPressColor: 'transparent',
      }}
    >
      {TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: t[tab.labelKey],
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? tab.icon : tab.iconOff} size={24} color={color} />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

function Root() {
  const { hydrated } = useSettings();
  const c = useColors();
  const scheme = useScheme();

  const navTheme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: c.bg, card: c.surface, text: c.ink, border: c.line, primary: c.blue },
  };

  const baseBg = c.bg === 'transparent' ? '#ffffff' : c.bg;

  return (
    <DesignThemeProvider scheme={scheme}>
      <View style={{ flex: 1, backgroundColor: baseBg }}>
        <AppBackground />
        {!hydrated ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={c.blue} />
          </View>
        ) : (
          <NavigationContainer theme={navTheme}>
            <MainTabs />
          </NavigationContainer>
        )}
      </View>
    </DesignThemeProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <SafeAreaProvider>
          <Root />
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}
