import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Plus, Target, TrendingDown, TrendingUp } from "lucide-react-native";
import TransactionForm from "../components/TransactionForm";
import { useAuth } from "../context/AuthContext";
import { useFinance } from "../context/FinanceContext";
import { formatBRL, signedAmount } from "../utils/format";
import { ActionTile, Card, Pill, SectionTitle, colors, headerGradient, radius, toneColor } from "../design-system";

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { months, selectedMonth, setSelectedMonth, monthTransactions, summary, loading, error } = useFinance();
  const [formOpen, setFormOpen] = useState(false);
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "O";

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <StatusBar style="light" />
      <LinearGradient colors={headerGradient} style={{ paddingBottom: 56 }}>
        <SafeAreaView edges={["top"]}>
          <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: colors.onAccent, fontWeight: "700", fontSize: 16 }}>{initial}</Text>
              </View>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>{user?.name}</Text>
            </View>
            <Text style={{ marginTop: 22, textAlign: "center", color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
              Saldo de {selectedMonth}
            </Text>
            <Text style={{ marginTop: 4, textAlign: "center", color: colors.onAccent, fontSize: 36, fontWeight: "700" }}>
              {formatBRL(summary.saldo)}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={{ marginTop: -36 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: radius.sheet,
            borderTopRightRadius: radius.sheet,
            paddingHorizontal: 20,
            paddingTop: 22,
            minHeight: 520,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 22 }}>
            <ActionTile
              label="Adicionar"
              tint="#EFE9FF"
              onPress={() => setFormOpen(true)}
              icon={<Plus color={colors.accent} size={18} />}
            />
            <ActionTile
              label="Ganhos"
              tint="#E7F8F0"
              onPress={() => navigation.navigate("Transacoes")}
              icon={<TrendingUp color={colors.success} size={18} />}
            />
            <ActionTile
              label="Gastos"
              tint="#FDECEE"
              onPress={() => navigation.navigate("Transacoes")}
              icon={<TrendingDown color={colors.danger} size={18} />}
            />
            <ActionTile
              label="Metas"
              tint="#E8F1FF"
              onPress={() => navigation.navigate("Metas")}
              icon={<Target color={colors.info} size={18} />}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginBottom: 18 }}>
            <Card style={{ flex: 1 }}>
              <Text style={{ color: colors.muted, fontSize: 12 }}>Receita</Text>
              <Text style={{ marginTop: 6, color: colors.success, fontSize: 16, fontWeight: "700" }}>
                {formatBRL(summary.receita)}
              </Text>
            </Card>
            <Card style={{ flex: 1 }}>
              <Text style={{ color: colors.muted, fontSize: 12 }}>Despesa</Text>
              <Text style={{ marginTop: 6, color: colors.danger, fontSize: 16, fontWeight: "700" }}>
                {formatBRL(summary.despesa)}
              </Text>
            </Card>
          </View>

          {error ? <Text style={{ color: colors.danger, marginBottom: 12 }}>{error}</Text> : null}

          <SectionTitle>Movimentações</SectionTitle>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, marginBottom: 14 }}>
            {months.map((month) => (
              <View key={month} style={{ marginRight: 8 }}>
                <Pill label={month.slice(0, 3)} selected={month === selectedMonth} onPress={() => setSelectedMonth(month)} />
              </View>
            ))}
          </ScrollView>

          {loading ? (
            <ActivityIndicator color={colors.accent} style={{ paddingVertical: 24 }} />
          ) : monthTransactions.length === 0 ? (
            <Text style={{ color: colors.muted, textAlign: "center", paddingVertical: 20 }}>Nenhuma transação neste mês.</Text>
          ) : (
            monthTransactions.map((item) => (
              <View
                key={item.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.line,
                }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={{ color: colors.ink, fontWeight: "600" }}>{item.title}</Text>
                  <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{item.category}</Text>
                </View>
                <Text style={{ color: toneColor(item.type), fontWeight: "700" }}>{signedAmount(item.type, item.value)}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <TransactionForm visible={formOpen} onClose={() => setFormOpen(false)} />
    </View>
  );
}
