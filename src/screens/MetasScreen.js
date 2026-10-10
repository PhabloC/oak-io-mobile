import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Screen from "../components/Screen";
import AppHeader from "../components/AppHeader";
import { CheckIcon, TrophyIcon, XIcon } from "../components/icons/UiIconSvg";
import { useFinance } from "../context/FinanceContext";
import { formatBRL } from "../utils/format";
import {
  META_CATEGORIES,
  imagesForCategory,
  searchMetaImages,
} from "../utils/metaImages";
import { Card, Field, Pill, PrimaryButton, Title, radius } from "../design-system";
import { useTheme } from "../context/ThemeContext";

export default function MetasScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { goals, goalsLoading, addGoal } = useFinance();
  const [tab, setTab] = useState("andamento");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [category, setCategory] = useState("Economia");
  const [imageUrl, setImageUrl] = useState("");
  const [imageSearch, setImageSearch] = useState("");
  const [imageResults, setImageResults] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [saving, setSaving] = useState(false);

  const visible = useMemo(
    () =>
      goals.filter((goal) =>
        tab === "concluidas"
          ? goal.completed || Number(goal.current_value) >= Number(goal.target_value)
          : !goal.completed && Number(goal.current_value) < Number(goal.target_value),
      ),
    [goals, tab],
  );

  useEffect(() => {
    if (!open) return;
    setImageResults(imagesForCategory(category));
  }, [open, category]);

  const resetForm = () => {
    setTitle("");
    setTarget("");
    setCurrent("");
    setCategory("Economia");
    setImageUrl("");
    setImageSearch("");
    setImageResults([]);
  };

  const searchImages = async (query) => {
    const term = query?.trim();
    if (!term) {
      setImageResults(imagesForCategory(category));
      return;
    }
    setLoadingImages(true);
    const results = await searchMetaImages(term);
    setImageResults(results);
    setLoadingImages(false);
  };

  const save = async () => {
    const targetValue = Number(String(target).replace(/\./g, "").replace(",", "."));
    const currentValue = Number(String(current).replace(/\./g, "").replace(",", ".")) || 0;
    if (!title.trim() || !targetValue) {
      Alert.alert("Campos obrigatórios", "Informe o nome e o valor alvo da meta.");
      return;
    }

    setSaving(true);
    const result = await addGoal({
      title: title.trim(),
      target_value: targetValue,
      current_value: currentValue,
      category,
      image_url: imageUrl || null,
    });
    setSaving(false);

    if (result?.error) {
      Alert.alert("Erro", "Não foi possível salvar a meta.");
      return;
    }

    resetForm();
    setOpen(false);
  };

  return (
    <Screen>
      <AppHeader onlyBack />
      <View
        style={{
          marginBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Title>Metas</Title>
        <Pill
          label="Adicionar"
          selected
          onPress={() => {
            resetForm();
            setImageResults(imagesForCategory("Economia"));
            setOpen(true);
          }}
        />
      </View>

      <View style={{ marginBottom: 16, flexDirection: "row", gap: 8 }}>
        <Pill
          label="Em andamento"
          selected={tab === "andamento"}
          onPress={() => setTab("andamento")}
        />
        <Pill
          label="Concluídas"
          selected={tab === "concluidas"}
          onPress={() => setTab("concluidas")}
          icon={<TrophyIcon color={tab === "concluidas" ? "#fff" : colors.accent} size={14} />}
        />
      </View>

      {goalsLoading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} />
      ) : visible.length === 0 ? (
        <Card>
          <Text style={{ textAlign: "center", color: colors.muted }}>
            Nenhuma meta nesta aba.
          </Text>
        </Card>
      ) : (
        visible.map((goal) => {
          const currentValue = Number(goal.current_value) || 0;
          const targetValue = Number(goal.target_value) || 1;
          const progress = Math.min(100, Math.round((currentValue / targetValue) * 100));
          const hasImage = Boolean(goal.image_url);

          const content = (
            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <View
                  style={{
                    backgroundColor: hasImage ? "rgba(255,255,255,0.18)" : colors.accentSoft,
                    borderRadius: 999,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Text
                    style={{
                      color: hasImage ? "#fff" : colors.accent,
                      fontSize: 11,
                      fontWeight: "700",
                    }}
                  >
                    {goal.category || "Meta"}
                  </Text>
                </View>
                {goal.completed ? (
                  <View
                    style={{
                      backgroundColor: "rgba(22,153,104,0.25)",
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <TrophyIcon color="#34D399" size={12} />
                    <Text style={{ color: "#34D399", fontSize: 11, fontWeight: "700" }}>
                      Concluída
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text
                style={{
                  color: hasImage ? "#fff" : colors.ink,
                  fontSize: 18,
                  fontWeight: "700",
                }}
              >
                {goal.title}
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  color: hasImage ? "rgba(255,255,255,0.85)" : colors.muted,
                }}
              >
                {formatBRL(currentValue)} de {formatBRL(targetValue)}
              </Text>

              <View
                style={{
                  marginTop: 12,
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: hasImage ? "rgba(255,255,255,0.25)" : colors.accentSoft,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: 8,
                    width: `${progress}%`,
                    backgroundColor: hasImage ? "#fff" : colors.accent,
                  }}
                />
              </View>
              <Text
                style={{
                  marginTop: 8,
                  color: hasImage ? "#fff" : colors.accent,
                  fontWeight: "700",
                  fontSize: 12,
                }}
              >
                {progress}%
              </Text>
            </View>
          );

          if (!hasImage) {
            return (
              <Card key={goal.id} padded={false} style={{ marginBottom: 12, overflow: "hidden" }}>
                {content}
              </Card>
            );
          }

          return (
            <View
              key={goal.id}
              style={{
                marginBottom: 12,
                borderRadius: radius.md,
                overflow: "hidden",
                backgroundColor: colors.surface,
              }}
            >
              <ImageBackground
                source={{ uri: goal.image_url }}
                style={{ minHeight: 170 }}
                resizeMode="cover"
              >
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(18, 16, 28, 0.62)",
                  }}
                >
                  {content}
                </View>
              </ImageBackground>
            </View>
          );
        })
      )}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(28, 27, 41, 0.45)" }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius.sheet,
              borderTopRightRadius: radius.sheet,
              maxHeight: "92%",
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: Math.max(insets.bottom, 16),
            }}
          >
            <View style={{ alignItems: "center", marginBottom: 10 }}>
              <View
                style={{ width: 42, height: 4, borderRadius: 999, backgroundColor: colors.line }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <Text style={{ color: colors.ink, fontSize: 20, fontWeight: "700" }}>Nova meta</Text>
              <Pressable
                onPress={() => setOpen(false)}
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
                label="Nome"
                placeholder="Ex: Viagem para a praia"
                value={title}
                onChangeText={setTitle}
              />
              <Field
                label="Valor alvo"
                placeholder="0,00"
                value={target}
                onChangeText={setTarget}
                keyboardType="decimal-pad"
              />
              <Field
                label="Valor atual"
                placeholder="0,00"
                value={current}
                onChangeText={setCurrent}
                keyboardType="decimal-pad"
              />

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
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                {META_CATEGORIES.map((item) => (
                  <View key={item} style={{ marginRight: 8 }}>
                    <Pill
                      label={item}
                      selected={category === item}
                      onPress={() => {
                        setCategory(item);
                        setImageResults(imagesForCategory(item));
                      }}
                    />
                  </View>
                ))}
              </ScrollView>

              <Text
                style={{
                  color: colors.muted,
                  fontSize: 12,
                  marginBottom: 8,
                  fontWeight: "600",
                }}
              >
                Imagem de fundo
              </Text>

              {imageUrl ? (
                <View style={{ marginBottom: 12, borderRadius: radius.sm, overflow: "hidden" }}>
                  <Image source={{ uri: imageUrl }} style={{ width: "100%", height: 120 }} />
                  <Pressable
                    onPress={() => setImageUrl("")}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      backgroundColor: "rgba(226, 85, 106, 0.9)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <XIcon color="#fff" size={16} />
                  </Pressable>
                </View>
              ) : null}

              <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
                <View style={{ flex: 1 }}>
                  <Field
                    placeholder="Buscar imagem..."
                    value={imageSearch}
                    onChangeText={setImageSearch}
                    onSubmitEditing={() => searchImages(imageSearch)}
                    returnKeyType="search"
                    style={{ marginBottom: 0 }}
                  />
                </View>
                <Pressable
                  onPress={() => searchImages(imageSearch)}
                  style={{
                    height: 50,
                    paddingHorizontal: 16,
                    borderRadius: radius.sm,
                    backgroundColor: colors.accent,
                    alignItems: "center",
                    justifyContent: "center",
                    alignSelf: "flex-end",
                  }}
                >
                  <Text style={{ color: colors.onAccent, fontWeight: "700", fontSize: 13 }}>
                    Buscar
                  </Text>
                </Pressable>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {["Economia", "Viagem", "Educação", "Compras", "Investimento"].map((term) => (
                  <View key={term} style={{ marginRight: 8 }}>
                    <Pill
                      label={term}
                      onPress={() => {
                        setImageSearch(term);
                        searchImages(term);
                      }}
                    />
                  </View>
                ))}
              </ScrollView>

              {loadingImages ? (
                <ActivityIndicator color={colors.accent} style={{ marginVertical: 16 }} />
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                    marginBottom: 18,
                  }}
                >
                  {imageResults.map((image) => {
                    const selected = imageUrl === image.url;
                    return (
                      <Pressable
                        key={image.id}
                        onPress={() => setImageUrl(image.url)}
                        style={{
                          width: "31%",
                          aspectRatio: 1.4,
                          borderRadius: 12,
                          overflow: "hidden",
                          borderWidth: 2,
                          borderColor: selected ? colors.accent : "transparent",
                        }}
                      >
                        <Image
                          source={{ uri: image.thumb }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                        {selected ? (
                          <View
                            style={[
                              StyleSheet.absoluteFill,
                              {
                                backgroundColor: "rgba(110, 86, 240, 0.35)",
                                alignItems: "center",
                                justifyContent: "center",
                              },
                            ]}
                          >
                            <CheckIcon color="#fff" size={20} strokeWidth={2.6} />
                          </View>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              )}

              <PrimaryButton
                label={saving ? "Salvando..." : "Salvar meta"}
                onPress={save}
                disabled={saving}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
