import { useState } from "react";
import { Alert, Modal, ScrollView, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { DEFAULT_CATEGORIES } from "../utils/categories";
import { dateForMonth } from "../utils/transactions";
import { useFinance } from "../context/FinanceContext";
import { Field, Pill, PrimaryButton, colors, radius } from "../design-system";

const TYPES = ["Ganho", "Gasto", "Investimento"];

export default function TransactionForm({ visible, onClose }) {
  const { addTransaction, selectedMonth } = useFinance();
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("Ganho");
  const [category, setCategory] = useState(DEFAULT_CATEGORIES.Ganho[0]);

  const changeType = (nextType) => {
    setType(nextType);
    setCategory(DEFAULT_CATEGORIES[nextType][0]);
  };

  const save = async () => {
    const numeric = Number(String(value).replace(/\./g, "").replace(",", "."));
    if (!title.trim() || !numeric) return;

    const result = await addTransaction({
      title: title.trim(),
      value: numeric,
      type,
      method: "Pix",
      date: dateForMonth(selectedMonth),
      month: selectedMonth,
      category,
      description: null,
      todos_meses: false,
    });
    if (result?.error) {
      Alert.alert("Não foi possível salvar", "A transação não entrou no Supabase. Tente novamente.");
      return;
    }
    setTitle("");
    setValue("");
    setType("Ganho");
    setCategory(DEFAULT_CATEGORIES.Ganho[0]);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(28, 27, 41, 0.4)" }}>
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: radius.sheet,
            borderTopRightRadius: radius.sheet,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 32,
          }}
        >
          <View style={{ marginBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ color: colors.ink, fontSize: 20, fontWeight: "700" }}>Nova transação</Text>
            <Pill label="Fechar" onPress={onClose} icon={<X color={colors.accent} size={14} />} />
          </View>
          <Field label="Título" value={title} onChangeText={setTitle} placeholder="Ex: Mercado" />
          <Field label="Valor" value={value} onChangeText={setValue} placeholder="0,00" keyboardType="decimal-pad" />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {TYPES.map((item) => (
              <Pill key={item} label={item} selected={type === item} onPress={() => changeType(item)} />
            ))}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
            {DEFAULT_CATEGORIES[type].map((item) => (
              <View key={item} style={{ marginRight: 8 }}>
                <Pill label={item} selected={category === item} onPress={() => setCategory(item)} />
              </View>
            ))}
          </ScrollView>
          <PrimaryButton label={`Salvar em ${selectedMonth}`} onPress={save} />
        </View>
      </View>
    </Modal>
  );
}
