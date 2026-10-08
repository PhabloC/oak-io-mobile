import { useState } from "react";
import { Modal, Text, View } from "react-native";
import { Trophy } from "lucide-react-native";
import Screen from "../components/Screen";
import AppHeader from "../components/AppHeader";
import { useFinance } from "../context/FinanceContext";
import { formatBRL } from "../utils/format";
import { Card, Field, Pill, PrimaryButton, Title } from "../design-system";
import { useTheme } from "../context/ThemeContext";

export default function MetasScreen() {
  const { colors } = useTheme();
  const { goals, addGoal } = useFinance();
  const [tab, setTab] = useState("andamento");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");

  const visible = goals.filter((goal) =>
    tab === "concluidas" ? goal.current >= goal.target : goal.current < goal.target,
  );

  const save = () => {
    const targetValue = Number(String(target).replace(",", "."));
    const currentValue = Number(String(current).replace(",", ".")) || 0;
    if (!name.trim() || !targetValue) return;
    addGoal({ name: name.trim(), target: targetValue, current: currentValue });
    setName("");
    setTarget("");
    setCurrent("");
    setOpen(false);
  };

  return (
    <Screen>
      <AppHeader />
      <View style={{ marginBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Title>Metas</Title>
        <Pill label="Nova" selected onPress={() => setOpen(true)} />
      </View>
      <View style={{ marginBottom: 16, flexDirection: "row", gap: 8 }}>
        <Pill label="Em andamento" selected={tab === "andamento"} onPress={() => setTab("andamento")} />
        <Pill
          label="Concluídas"
          selected={tab === "concluidas"}
          onPress={() => setTab("concluidas")}
          icon={<Trophy color={tab === "concluidas" ? "#fff" : colors.accent} size={14} />}
        />
      </View>
      {visible.length === 0 ? (
        <Card>
          <Text style={{ textAlign: "center", color: colors.muted }}>Nenhuma meta nesta aba.</Text>
        </Card>
      ) : (
        visible.map((goal) => {
          const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
          return (
            <Card key={goal.id} style={{ marginBottom: 12 }}>
              <Text style={{ color: colors.ink, fontSize: 17, fontWeight: "700" }}>{goal.name}</Text>
              <Text style={{ marginTop: 6, color: colors.muted }}>
                {formatBRL(goal.current)} de {formatBRL(goal.target)}
              </Text>
              <View style={{ marginTop: 12, height: 8, borderRadius: 999, backgroundColor: colors.accentSoft, overflow: "hidden" }}>
                <View style={{ height: 8, width: `${progress}%`, backgroundColor: colors.accent }} />
              </View>
              <Text style={{ marginTop: 8, color: colors.accent, fontWeight: "700", fontSize: 12 }}>{progress}%</Text>
            </Card>
          );
        })
      )}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(28, 27, 41, 0.4)" }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 20, paddingBottom: 32 }}>
            <Text style={{ color: colors.ink, fontSize: 20, fontWeight: "700", marginBottom: 14 }}>Nova meta</Text>
            <Field placeholder="Nome da meta" value={name} onChangeText={setName} />
            <Field placeholder="Valor alvo" value={target} onChangeText={setTarget} keyboardType="decimal-pad" />
            <Field placeholder="Valor atual" value={current} onChangeText={setCurrent} keyboardType="decimal-pad" />
            <PrimaryButton label="Salvar meta" onPress={save} />
            <View style={{ height: 10 }} />
            <Pill label="Cancelar" onPress={() => setOpen(false)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
