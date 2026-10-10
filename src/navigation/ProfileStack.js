import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "../context/ThemeContext";
import PerfilScreen from "../screens/PerfilScreen";
import DadosPessoaisScreen from "../screens/DadosPessoaisScreen";
import ConfiguracoesScreen from "../screens/ConfiguracoesScreen";
import NotificacoesScreen from "../screens/NotificacoesScreen";

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "none",
        detachPreviousScreen: false,
        freezeOnBlur: true,
        contentStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Stack.Screen name="PerfilHome" component={PerfilScreen} />
      <Stack.Screen name="DadosPessoais" component={DadosPessoaisScreen} />
      <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} />
      <Stack.Screen name="Notificacoes" component={NotificacoesScreen} />
    </Stack.Navigator>
  );
}
