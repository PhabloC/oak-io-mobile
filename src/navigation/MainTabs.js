import {
  CircleDollarSign,
  LayoutDashboard,
  Target,
  UserRound,
} from "lucide-react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FloatingTabBar from "../components/FloatingTabBar";
import DashboardScreen from "../screens/DashboardScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import MetasScreen from "../screens/MetasScreen";
import PerfilScreen from "../screens/PerfilScreen";

const Tab = createBottomTabNavigator();

const tabs = [
  { name: "Dashboard", component: DashboardScreen, Icon: LayoutDashboard, label: "Início" },
  { name: "Transacoes", component: TransactionsScreen, Icon: CircleDollarSign, label: "Extrato" },
  { name: "Metas", component: MetasScreen, Icon: Target, label: "Metas" },
  { name: "Perfil", component: PerfilScreen, Icon: UserRound, label: "Perfil" },
];

export default function MainTabs() {
  return (
    <Tab.Navigator
      implementation="custom"
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: "fade",
        lazy: true,
      }}
    >
      {tabs.map(({ name, component, Icon, label }) => (
        <Tab.Screen
          key={name}
          name={name}
          component={component}
          options={{
            tabBarLabel: label,
            tabBarIconComponent: Icon,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
