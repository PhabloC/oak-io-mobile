import { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FloatingTabBar from "../components/FloatingTabBar";
import TransactionForm from "../components/TransactionForm";
import {
  CircleDollarIcon,
  HomeIcon,
  TargetIcon,
  UserIcon,
} from "../components/icons/UiIconSvg";
import DashboardScreen from "../screens/DashboardScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import MetasScreen from "../screens/MetasScreen";
import ProfileStack from "./ProfileStack";

const Tab = createBottomTabNavigator();

const tabs = [
  { name: "Dashboard", component: DashboardScreen, Icon: HomeIcon, label: "Início" },
  { name: "Transacoes", component: TransactionsScreen, Icon: CircleDollarIcon, label: "Extrato" },
  { name: "Metas", component: MetasScreen, Icon: TargetIcon, label: "Metas" },
  { name: "Perfil", component: ProfileStack, Icon: UserIcon, label: "Perfil" },
];

export default function MainTabs() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <>
      <Tab.Navigator
        implementation="custom"
        tabBar={(props) => (
          <FloatingTabBar {...props} onAddPress={() => setFormOpen(true)} />
        )}
        screenOptions={{
          headerShown: false,
          animation: "none",
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

      <TransactionForm visible={formOpen} onClose={() => setFormOpen(false)} />
    </>
  );
}
