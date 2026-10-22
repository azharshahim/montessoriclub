import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/** Valeurs en centimes. */
export type Denomination = 10 | 20 | 50 | 100 | 200 | 500 | 1000 | 2000;

export function isNote(value: number): boolean {
  return value >= 500;
}

/** « 2,50 € » en français et arabe, « €2.50 » en anglais. */
export function formatMoney(cents: number, language: 'fr' | 'en' | 'ar'): string {
  const euros = Math.floor(cents / 100);
  const rest = cents % 100;
  const separator = language === 'en' ? '.' : ',';
  const amount = rest === 0 ? `${euros}` : `${euros}${separator}${String(rest).padStart(2, '0')}`;
  return language === 'en' ? `€${amount}` : `${amount} €`;
}

function label(value: number): string {
  return value < 100 ? `${value} c` : `${value / 100} €`;
}

const NOTE_COLORS: Record<number, { bg: string; border: string }> = {
  500: { bg: '#B9C4C0', border: '#7C8B86' },
  1000: { bg: '#F2A7A0', border: '#C2574E' },
  2000: { bg: '#9CC3F0', border: '#4E8FE0' },
};

/** Pièce (centimes en cuivre, euros en or et argent) ou billet. */
export function MoneyItem({ value }: { value: Denomination }) {
  if (isNote(value)) {
    const c = NOTE_COLORS[value] ?? NOTE_COLORS[500];
    return (
      <View style={[styles.note, { backgroundColor: c.bg, borderColor: c.border }]} accessible={false}>
        <Text style={styles.noteText}>{label(value)}</Text>
      </View>
    );
  }
  const cents = value < 100;
  return (
    <View
      style={[
        styles.coin,
        cents
          ? { backgroundColor: '#D9955F', borderColor: '#A86A38' }
          : { backgroundColor: value === 200 ? '#E9EAEC' : '#EBC95A', borderColor: value === 200 ? '#E8C45A' : '#B8932E' },
        value >= 100 && styles.coinLarge,
      ]}
      accessible={false}
    >
      <Text style={styles.coinText}>{label(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  coin: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinLarge: { width: 60, height: 60, borderRadius: 30 },
  coinText: { fontSize: 15, fontWeight: '800', color: '#4A3B10' },
  note: {
    width: 92,
    height: 50,
    borderRadius: 6,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteText: { fontSize: 18, fontWeight: '800', color: '#33302E' },
});
