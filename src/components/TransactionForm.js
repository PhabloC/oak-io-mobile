import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CalendarIcon, XIcon } from "./icons/UiIconSvg";
import { DEFAULT_CATEGORIES } from "../utils/categories";
import { MONTHS, dateForMonth } from "../utils/transactions";
import { useFinance } from "../context/FinanceContext";
import { Field, Pill, PrimaryButton, radius } from "../design-system";
import { useTheme } from "../context/ThemeContext";

const TYPES = ["Ganho", "Gasto", "Investimento"];
const METHODS = ["Pix", "Boleto", "Cartão"];

function formatInputCurrency(inputValue) {
  const digits = String(inputValue || "").replace(/\D/g, "");
  if (!digits) return "";
  const number = parseInt(digits, 10) / 100;
  return number.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseCurrencyToNumber(inputValue) {
  if (!inputValue) return 0;
  return parseFloat(String(inputValue).replace(/\./g, "").replace(",", ".")) || 0;
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthNameFromDate(date) {
  return MONTHS[date.getMonth()];
}

function formatDisplayDate(date) {
  return date.toLocaleDateString("pt-BR");
}

function parseDateString(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
}

export default function TransactionForm({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { addTransaction, selectedMonth } = useFinance();

  const initialDate = useMemo(
    () => parseDateString(dateForMonth(selectedMonth)),
    [selectedMonth],
  );

  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("Ganho");
  const [method, setMethod] = useState("Pix");
  const [date, setDate] = useState(initialDate);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [todosMeses, setTodosMeses] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTitle("");
    setValue("");
    setType("Ganho");
    setMethod("Pix");
    setDate(parseDateString(dateForMonth(selectedMonth)));
    setCategory("");
    setDescription("");
    setTodosMeses(false);
    setShowDatePicker(false);
    setSaving(false);
  }, [visible, selectedMonth]);

  const changeType = (nextType) => {
    setType(nextType);
    setCategory("");
  };

  const onDateChange = (_event, selected) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (selected) setDate(selected);
  };

  const save = async () => {
    const numeric = parseCurrencyToNumber(value);
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      Alert.alert("Campo obrigatório", "Informe o título da transação.");
      return;
    }
    if (!numeric) {
      Alert.alert("Campo obrigatório", "Informe um valor válido.");
      return;
    }

    setSaving(true);
    const result = await addTransaction({
      title: cleanTitle,
      value: numeric,
      type,
      method,
      date: toDateInputValue(date),
      month: monthNameFromDate(date),
      category: category || null,
      description: description.trim() || null,
      todos_meses: todosMeses,
    });
    setSaving(false);

    if (result?.error) {
      Alert.alert("Não foi possível salvar", "A transação não entrou no Supabase. Tente novamente.");
      return;
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(28, 27, 41, 0.45)" }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ maxHeight: "92%" }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius.sheet,
              borderTopRightRadius: radius.sheet,
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: Math.max(insets.bottom, 16),
              maxHeight: "100%",
            }}
          >
            <View style={{ alignItems: "center", marginBottom: 10 }}>
              <View
                style={{
                  width: 42,
                  height: 4,
                  borderRadius: 999,
                  backgroundColor: colors.line,
                }}
              />
            </View>

            <View
              style={{
                marginBottom: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ color: colors.ink, fontSize: 20, fontWeight: "700" }}>
                  Nova transação
                </Text>
                <Text style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}>
                  Preencha as informações abaixo
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={10}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: colors.accentSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <XIcon color={colors.accent} size={18} />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 12 }}
            >
              <Field
                label="Título"
                value={title}
                onChangeText={setTitle}
                placeholder="Ex: Compra no mercado"
                maxLength={100}
              />

              <Field
                label="Valor"
                value={value}
                onChangeText={(text) => setValue(formatInputCurrency(text))}
                placeholder="0,00"
                keyboardType="number-pad"
              />

              <Text
                style={{
                  color: colors.muted,
                  fontSize: 12,
                  marginBottom: 8,
                  fontWeight: "600",
                }}
              >
                Data
              </Text>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                style={{
                  backgroundColor: colors.canvas,
                  borderRadius: radius.sm,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  marginBottom: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: colors.ink, fontSize: 16 }}>
                  {formatDisplayDate(date)}
                </Text>
                <CalendarIcon color={colors.muted} size={18} />
              </Pressable>

              {showDatePicker ? (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onDateChange}
                  themeVariant="light"
                />
              ) : null}

              {Platform.OS === "ios" && showDatePicker ? (
                <View style={{ alignItems: "flex-end", marginBottom: 12 }}>
                  <Pill label="Confirmar data" selected onPress={() => setShowDatePicker(false)} />
                </View>
              ) : null}

              <Text
                style={{
                  color: colors.muted,
                  fontSize: 12,
                  marginBottom: 8,
                  fontWeight: "600",
                }}
              >
                Tipo de transação
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                {TYPES.map((item) => (
                  <Pill
                    key={item}
                    label={item}
                    selected={type === item}
                    onPress={() => changeType(item)}
                  />
                ))}
              </View>

              <Text
                style={{
                  color: colors.muted,
                  fontSize: 12,
                  marginBottom: 8,
                  fontWeight: "600",
                }}
              >
                Método de pagamento
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                {METHODS.map((item) => (
                  <Pill
                    key={item}
                    label={item}
                    selected={method === item}
                    onPress={() => setMethod(item)}
                  />
                ))}
              </View>

              <Text
                style={{
                  color: colors.muted,
                  fontSize: 12,
                  marginBottom: 8,
                  fontWeight: "600",
                }}
              >
                Categoria
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 14 }}
              >
                {DEFAULT_CATEGORIES[type].map((item) => (
                  <View key={item} style={{ marginRight: 8 }}>
                    <Pill
                      label={item}
                      selected={category === item}
                      onPress={() => setCategory(item)}
                    />
                  </View>
                ))}
              </ScrollView>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 12,
                  borderRadius: radius.sm,
                  backgroundColor: colors.accentSoft,
                  padding: 14,
                  marginBottom: 14,
                }}
              >
                <Switch
                  value={todosMeses}
                  onValueChange={setTodosMeses}
                  trackColor={{ false: colors.line, true: colors.accent }}
                  thumbColor={colors.onAccent}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.ink, fontSize: 14, fontWeight: "600" }}>
                    Usar em todos os meses
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4, lineHeight: 17 }}>
                    A transação aparece de janeiro a dezembro do ano da data. Útil para
                    assinaturas e gastos fixos.
                  </Text>
                </View>
              </View>

              <Field
                label="Descrição (opcional)"
                value={description}
                onChangeText={setDescription}
                placeholder="Observações ou notas sobre esta transação"
                maxLength={500}
                multiline
                numberOfLines={3}
                style={{ marginBottom: 8 }}
              />
            </ScrollView>

            <View
              style={{
                marginTop: 8,
                paddingTop: 14,
                paddingBottom: 4,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.line,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PrimaryButton
                label={saving ? "Salvando..." : "Adicionar"}
                onPress={save}
                disabled={saving}
                style={{ width: 220 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
