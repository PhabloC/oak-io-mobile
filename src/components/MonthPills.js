import { useCallback, useEffect, useRef } from "react";
import { ScrollView, View } from "react-native";
import { Pill } from "../design-system";

export default function MonthPills({ months, selectedMonth, onSelect }) {
  const scrollRef = useRef(null);
  const positions = useRef({});
  const selectedMonthRef = useRef(selectedMonth);
  selectedMonthRef.current = selectedMonth;

  const scrollToSelected = useCallback((animated = true) => {
    const month = selectedMonthRef.current;
    const x = positions.current[month];
    if (x == null || !scrollRef.current) return;
    scrollRef.current.scrollTo({ x: Math.max(0, x - 8), animated });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => scrollToSelected(true), 60);
    return () => clearTimeout(timer);
  }, [selectedMonth, months, scrollToSelected]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginBottom: 12 }}
      contentContainerStyle={{ paddingRight: 20 }}
      onContentSizeChange={() => scrollToSelected(false)}
    >
      {months.map((month) => (
        <View
          key={month}
          style={{ marginRight: 8 }}
          onLayout={(event) => {
            positions.current[month] = event.nativeEvent.layout.x;
            if (month === selectedMonthRef.current) {
              scrollToSelected(false);
            }
          }}
        >
          <Pill label={month.slice(0, 3)} selected={month === selectedMonth} onPress={() => onSelect(month)} />
        </View>
      ))}
    </ScrollView>
  );
}
