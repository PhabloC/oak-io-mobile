import { View } from "react-native";
import { CategoryIconSvg } from "./icons/CategoryIconSvg";
import { getTransactionIconMeta } from "../utils/transactionIcon";

export default function TransactionTypeIcon({ type, category, size = 40 }) {
  const meta = getTransactionIconMeta(type, category);

  return (
    <View accessible accessibilityLabel={category || type || "Categoria"}>
      <CategoryIconSvg name={meta.name} size={size} />
    </View>
  );
}
