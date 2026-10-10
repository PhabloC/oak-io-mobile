import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Screen from "../components/Screen";
import AppHeader from "../components/AppHeader";
import {
  BellIcon,
  BellOffIcon,
  CircleAlertIcon,
  TargetIcon,
  TrendingDownIcon,
  WalletIcon,
} from "../components/icons/UiIconSvg";
import { useFinance } from "../context/FinanceContext";
import { useTheme } from "../context/ThemeContext";
import { formatBRL } from "../utils/format";
import { currentMonthName, transactionMatchesMonth } from "../utils/transactions";
import { Subtitle, Title, radius } from "../design-system";

const STORAGE_KEY = "oakio.notificationPrefs";

const DEFAULT_PREFS = {
  metas: true,
  gastos: true,
  resumo: true,
};

function PrefRow({ label, description, value, onValueChange, colors, isLast = false }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.line,
        gap: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.ink, fontSize: 15, fontWeight: "600" }}>{label}</Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 3, lineHeight: 17 }}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.line, true: colors.accent }}
        thumbColor={colors.onAccent}
      />
    </View>
  );
}

function NotificationCard({ icon: Icon, tint, title, body, time, unread, colors, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        gap: 12,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: unread ? colors.accent : colors.line,
        padding: 14,
        marginBottom: 10,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 14,
          backgroundColor: tint,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon color={colors.ink} size={18} strokeWidth={2.1} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ flex: 1, color: colors.ink, fontSize: 15, fontWeight: "700" }}>
            {title}
          </Text>
          {unread ? (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.accent,
              }}
            />
          ) : null}
        </View>
        <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4, lineHeight: 18 }}>
          {body}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 11, marginTop: 8 }}>{time}</Text>
      </View>
    </Pressable>
  );
}

export default function NotificacoesScreen() {
  const { colors } = useTheme();
  const { goals, transactions, summary, selectedMonth } = useFinance();
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [readIds, setReadIds] = useState([]);
  const month = selectedMonth || currentMonthName();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        setPrefs({ ...DEFAULT_PREFS, ...parsed.prefs });
        setReadIds(Array.isArray(parsed.readIds) ? parsed.readIds : []);
      } catch {
        // ignore corrupt storage
      }
    });
  }, []);

  const persist = useCallback((nextPrefs, nextReadIds) => {
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ prefs: nextPrefs, readIds: nextReadIds }),
    );
  }, []);

  const updatePref = (key, value) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    persist(next, readIds);
  };

  const notifications = useMemo(() => {
    const items = [];
    const monthTx = transactions.filter((item) => transactionMatchesMonth(item, month));

    if (prefs.metas) {
      goals
        .filter((goal) => !goal.completed)
        .forEach((goal) => {
          const current = Number(goal.current_value) || 0;
          const target = Number(goal.target_value) || 0;
          if (!target) return;
          const progress = Math.round((current / target) * 100);
          if (progress >= 80) {
            items.push({
              id: `meta-${goal.id}`,
              icon: TargetIcon,
              tint: colors.tintInfo,
              title: "Meta quase concluída",
              body: `${goal.title} está em ${progress}% (${formatBRL(current)} de ${formatBRL(target)}).`,
              time: "Agora",
            });
          } else if (progress === 0) {
            items.push({
              id: `meta-start-${goal.id}`,
              icon: TargetIcon,
              tint: colors.accentSoft,
              title: "Meta sem progresso",
              body: `Você ainda não registrou valores em “${goal.title}”.`,
              time: "Hoje",
            });
          }
        });
    }

    if (prefs.gastos) {
      const gastos = monthTx
        .filter((item) => item.type === "Gasto")
        .reduce((acc, item) => acc + Math.abs(Number(item.value) || 0), 0);
      if (gastos > 0) {
        items.push({
          id: `gastos-${month}`,
          icon: TrendingDownIcon,
          tint: colors.tintDanger,
          title: `Gastos de ${month}`,
          body: `Você já registrou ${formatBRL(gastos)} em despesas neste mês.`,
          time: "Hoje",
        });
      }
      if (summary.saldo < 0) {
        items.push({
          id: `saldo-${month}`,
          icon: CircleAlertIcon,
          tint: colors.tintWarning,
          title: "Saldo negativo no mês",
          body: `Seu saldo de ${month} está em ${formatBRL(summary.saldo)}. Revise os gastos.`,
          time: "Hoje",
        });
      }
    }

    if (prefs.resumo) {
      items.push({
        id: `resumo-${month}`,
        icon: WalletIcon,
        tint: colors.tintSuccess,
        title: `Resumo de ${month}`,
        body: `Receita ${formatBRL(summary.receita)} · Despesa ${formatBRL(summary.despesa)} · Saldo ${formatBRL(summary.saldo)}.`,
        time: "Atualizado",
      });
    }

    return items;
  }, [prefs, goals, transactions, month, summary, colors]);

  const markAsRead = (id) => {
    if (readIds.includes(id)) return;
    const next = [...readIds, id];
    setReadIds(next);
    persist(prefs, next);
  };

  const markAllRead = () => {
    const next = [...new Set([...readIds, ...notifications.map((item) => item.id)])];
    setReadIds(next);
    persist(prefs, next);
  };

  const unreadCount = notifications.filter((item) => !readIds.includes(item.id)).length;

  return (
    <Screen>
      <AppHeader onlyBack />
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Title>Notificações</Title>
          <Subtitle>
            {unreadCount > 0
              ? `${unreadCount} não lida${unreadCount > 1 ? "s" : ""}`
              : "Você está em dia"}
          </Subtitle>
        </View>
        {notifications.length > 0 ? (
          <Pressable onPress={markAllRead} hitSlop={8} style={{ paddingTop: 6 }}>
            <Text style={{ color: colors.accent, fontSize: 13, fontWeight: "700" }}>
              Marcar todas
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View
        style={{
          marginTop: 20,
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.line,
          paddingHorizontal: 16,
          marginBottom: 22,
        }}
      >
        <Text style={{ color: colors.ink, fontSize: 16, fontWeight: "700", marginTop: 14 }}>
          Preferências
        </Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4, marginBottom: 4 }}>
          Escolha o que deseja receber no app
        </Text>
        <PrefRow
          label="Alertas de metas"
          description="Avisos quando uma meta avança ou fica parada"
          value={prefs.metas}
          onValueChange={(value) => updatePref("metas", value)}
          colors={colors}
        />
        <PrefRow
          label="Alertas de gastos"
          description="Resumo de despesas e saldo negativo"
          value={prefs.gastos}
          onValueChange={(value) => updatePref("gastos", value)}
          colors={colors}
        />
        <PrefRow
          label="Resumo do mês"
          description="Visão geral de receita, despesa e saldo"
          value={prefs.resumo}
          onValueChange={(value) => updatePref("resumo", value)}
          colors={colors}
          isLast
        />
      </View>

      <Text style={{ color: colors.ink, fontSize: 17, fontWeight: "700", marginBottom: 10 }}>
        Caixa de entrada
      </Text>

      {notifications.length === 0 ? (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.line,
            padding: 28,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              backgroundColor: colors.accentSoft,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            {prefs.metas || prefs.gastos || prefs.resumo ? (
              <BellIcon color={colors.accent} size={24} />
            ) : (
              <BellOffIcon color={colors.muted} size={24} />
            )}
          </View>
          <Text style={{ color: colors.ink, fontSize: 16, fontWeight: "700", textAlign: "center" }}>
            Nenhuma notificação
          </Text>
          <Text
            style={{
              color: colors.muted,
              fontSize: 13,
              textAlign: "center",
              marginTop: 6,
              lineHeight: 18,
            }}
          >
            {prefs.metas || prefs.gastos || prefs.resumo
              ? "Quando houver alertas sobre suas finanças, eles aparecem aqui."
              : "Ative alguma preferência acima para começar a receber alertas."}
          </Text>
        </View>
      ) : (
        notifications.map((item) => (
          <NotificationCard
            key={item.id}
            icon={item.icon}
            tint={item.tint}
            title={item.title}
            body={item.body}
            time={item.time}
            unread={!readIds.includes(item.id)}
            colors={colors}
            onPress={() => markAsRead(item.id)}
          />
        ))
      )}
    </Screen>
  );
}
