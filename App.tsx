import { Component, type ReactNode } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColors, useScheme } from './src/theme';
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

const Tab = createBottomTabNavigator();

type IoniconName = keyof typeof Ionicons.glyphMap;
type TabLabelKey = 'tabHome' | 'tabShort' | 'tabLong' | 'tabDict' | 'tabSettings';
const TABS: { name: string; labelKey: TabLabelKey; component: React.ComponentType; icon: IoniconName; iconOff: IoniconName }[] = [
  { name: 'Home', labelKey: 'tabHome', component: HomeScreen, icon: 'home', iconOff: 'home-outline' },
  { name: 'Short', labelKey: 'tabShort', component: ShortTab, icon: 'chatbox-ellipses', iconOff: 'chatbox-ellipses-outline' },
  { name: 'Long', labelKey: 'tabLong', component: LongTab, icon: 'book', iconOff: 'book-outline' },
  { name: 'Dictionary', labelKey: 'tabDict', component: DictScreen, icon: 'search', iconOff: 'search-outline' },
  { name: 'Settings', labelKey: 'tabSettings', component: SettingsScreen, icon: 'settings', iconOff: 'settings-outline' },
];

function MainTabs() {
  const c = useColors();
  const t = useT();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.blue,
        tabBarInactiveTintColor: c.faint,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.line },
      }}
    >
      {TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: t[tab.labelKey],
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? tab.icon : tab.iconOff} size={size ?? 24} color={color} />
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

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg }}>
        <ActivityIndicator color={c.blue} />
      </View>
    );
  }

  return (
    <DesignThemeProvider scheme={scheme}>
      <NavigationContainer theme={navTheme}>
        <MainTabs />
      </NavigationContainer>
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
