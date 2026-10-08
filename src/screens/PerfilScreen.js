import { useState } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ChartColumn, LogOut, Moon, Monitor, Receipt, Sun } from "lucide-react-native";
import Screen from "../components/Screen";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useAuth } from "../context/AuthContext";
import { useFinance } from "../context/FinanceContext";
import { THEME_OPTIONS, useTheme } from "../context/ThemeContext";
import { formatBRL } from "../utils/format";
import { cn } from "@/lib/utils";

const THEME_ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export default function PerfilScreen() {
  const navigation = useNavigation();
  const { user, signOut, updateProfile } = useAuth();
  const { assets } = useFinance();
  const { preference, setPreference, colors } = useTheme();
  const [name, setName] = useState(user?.name || "");
  const [message, setMessage] = useState("");
  const patrimonio = assets.reduce((acc, asset) => acc + asset.current, 0);
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "O";

  const save = () => {
    const nextName = name.trim();
    if (!nextName) return;
    updateProfile(nextName);
    setMessage("Perfil atualizado.");
  };

  return (
    <Screen>
      <Card className="items-center py-8">
        <CardContent className="items-center gap-3 px-0">
          <Avatar className="size-20" alt={user?.name || "Usuário"}>
            {user?.avatar ? <AvatarImage source={{ uri: user.avatar }} /> : null}
            <AvatarFallback className="bg-primary">
              <Text className="text-2xl font-bold text-primary-foreground">{initial}</Text>
            </AvatarFallback>
          </Avatar>
          <View className="items-center gap-1">
            <Text variant="h4" className="text-center">
              {user?.name}
            </Text>
            <Text variant="muted" className="text-center">
              {user?.email}
            </Text>
            <Text className="mt-2 font-bold text-primary">Patrimônio {formatBRL(patrimonio)}</Text>
          </View>
        </CardContent>
      </Card>

      <Text variant="large" className="mb-3 mt-6">
        Aparência
      </Text>
      <Card className="py-2">
        <CardContent className="flex-row gap-2 px-2">
          {THEME_OPTIONS.map((option) => {
            const selected = preference === option.value;
            const Icon = THEME_ICONS[option.value];
            return (
              <Button
                key={option.value}
                variant={selected ? "default" : "ghost"}
                className={cn("h-auto flex-1 flex-col gap-1.5 py-3")}
                onPress={() => setPreference(option.value)}
              >
                <Icon size={20} strokeWidth={2.2} color={selected ? colors.onAccent : colors.muted} />
                <Text className={cn("text-xs font-bold", selected ? "text-primary-foreground" : "text-muted-foreground")}>
                  {option.label}
                </Text>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      <Text variant="large" className="mb-3 mt-6">
        Mais
      </Text>
      <View className="mb-2 flex-row gap-2">
        <Button
          variant="outline"
          className="h-auto flex-1 flex-col gap-2 py-4"
          onPress={() => navigation.navigate("Dividas")}
        >
          <Receipt size={18} color="#D9922A" />
          <Text className="text-xs font-semibold">Dívidas</Text>
        </Button>
        <Button
          variant="outline"
          className="h-auto flex-1 flex-col gap-2 py-4"
          onPress={() => navigation.navigate("Investimento")}
        >
          <ChartColumn size={18} color="#3B82F6" />
          <Text className="text-xs font-semibold">Investir</Text>
        </Button>
      </View>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Conta</CardTitle>
          <CardDescription>Atualize como seu nome aparece no app.</CardDescription>
        </CardHeader>
        <CardContent className="gap-3">
          <View className="gap-2">
            <Label nativeID="displayName">Nome de exibição</Label>
            <Input
              aria-labelledby="displayName"
              value={name}
              onChangeText={setName}
              placeholder="Seu nome"
            />
          </View>
          <Button onPress={save}>
            <Text>Salvar</Text>
          </Button>
          {message ? <Text className="text-sm font-medium text-primary">{message}</Text> : null}
        </CardContent>
      </Card>

      <Separator className="my-5" />

      <Button variant="destructive" onPress={signOut}>
        <LogOut size={18} color="#fff" />
        <Text>Sair</Text>
      </Button>
    </Screen>
  );
}
