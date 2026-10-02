import { View } from "react-native";
import {
  ChartColumn,
  CircleDollarSign,
  LayoutDashboard,
  Receipt,
  Target,
  UserRound,
} from "lucide-react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardScreen from "../screens/DashboardScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import MetasScreen from "../screens/MetasScreen";
import DividasScreen from "../screens/DividasScreen";
import InvestimentoScreen from "../screens/InvestimentoScreen";
import PerfilScreen from "../screens/PerfilScreen";
import { colors, shadow } from "../design-system";

const Tab = createBottomTabNavigator();

const tabs = [
  { name: "Dashboard", component: DashboardScreen, Icon: LayoutDashboard },
  { name: "Transacoes", component: TransactionsScreen, Icon: CircleDollarSign },
  { name: "Metas", component: MetasScreen, Icon: Target },
  { name: "Dividas", component: DividasScreen, Icon: Receipt },
  { name: "Investimento", component: InvestimentoScreen, Icon: ChartColumn },
  { name: "Perfil", component: PerfilScreen, Icon: UserRound },
];

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.onAccent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 16,
          height: 68,
          borderTopWidth: 0,
          borderRadius: 28,
          backgroundColor: colors.surface,
          boxShadow: shadow.float,
          paddingHorizontal: 8,
        },
      }}
    >
      {tabs.map(({ name, component, Icon }) => (
        <Tab.Screen
          key={name}
          name={name}
          component={component}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: focused ? colors.accent : "transparent",
                }}
              >
                <Icon color={color} size={20} />
              </View>
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
