import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useI18n } from '../i18n';
import { useSettings } from '../store/settings';
import { useTheme } from '../theme';
import { Button } from './Button';

/**
 * Définition du code parental (4 chiffres).
 *
 * Ce code n'est pas un secret cryptographique : il empêche un enfant d'ouvrir
 * par hasard les réglages, le temps d'écran ou la suppression de profil. Il est
 * stocké localement, comme le reste des données, et jamais transmis.
 */
export function ParentalCodeCard() {
  const { t } = useI18n();
  const { colors, radius, text } = useTheme();
  const code = useSettings((s) => s.parentalCode);
  const setParentalCode = useSettings((s) => s.setParentalCode);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setCurrent('');
    setNext('');
    setConfirm('');
  };

  const feedback = (textValue: string | null, errorValue: string | null) => {
    setMessage(textValue);
    setError(errorValue);
  };

  const save = () => {
    if (code && current !== code) {
      feedback(null, t('parents.codeWrong'));
      return;
    }
    if (!/^\d{4}$/.test(next)) {
      feedback(null, t('parents.codeInvalid'));
      return;
    }
    if (next !== confirm) {
      feedback(null, t('parents.codeMismatch'));
      return;
    }
    setParentalCode(next);
    reset();
    feedback(t('parents.codeSaved'), null);
  };

  const remove = () => {
    if (code && current !== code) {
      feedback(null, t('parents.codeWrong'));
      return;
    }
    setParentalCode(null);
    reset();
    feedback(t('parents.codeRemoved'), null);
  };

  const inputStyle = [
    styles.input,
    {
      borderColor: error ? colors.error : colors.sand,
      borderRadius: radius.md,
      color: colors.ink,
      backgroundColor: colors.surface,
    },
  ];

  return (
    <View style={styles.wrap}>
      <Text style={[text.body, { color: colors.inkSoft }]}>{t('parents.codeHint')}</Text>

      {code ? (
        <TextInput
          value={current}
          onChangeText={(value) => {
            setCurrent(value.replace(/[^0-9]/g, ''));
            feedback(null, null);
          }}
          placeholder={t('parents.codeCurrent')}
          placeholderTextColor={colors.inkFaint}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={4}
          secureTextEntry
          accessibilityLabel={t('parents.codeCurrent')}
          style={inputStyle}
        />
      ) : null}

      <View style={styles.row}>
        <TextInput
          value={next}
          onChangeText={(value) => {
            setNext(value.replace(/[^0-9]/g, ''));
            feedback(null, null);
          }}
          placeholder={code ? t('parents.codeNew') : t('parents.codeCreate')}
          placeholderTextColor={colors.inkFaint}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={4}
          secureTextEntry
          accessibilityLabel={code ? t('parents.codeNew') : t('parents.codeCreate')}
          style={[...inputStyle, styles.half]}
        />
        <TextInput
          value={confirm}
          onChangeText={(value) => {
            setConfirm(value.replace(/[^0-9]/g, ''));
            feedback(null, null);
          }}
          placeholder={t('parents.codeConfirm')}
          placeholderTextColor={colors.inkFaint}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={4}
          secureTextEntry
          accessibilityLabel={t('parents.codeConfirm')}
          style={[...inputStyle, styles.half]}
        />
      </View>

      {error ? (
        <Text style={[text.label, { color: colors.error }]} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
      {message && !error ? (
        <Text style={[text.label, { color: colors.success }]} accessibilityLiveRegion="polite">
          {message}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Button
          label={code ? t('parents.codeChange') : t('parents.codeCreate')}
          icon="check"
          size="md"
          onPress={save}
          disabled={
            !/^\d{4}$/.test(next) || !/^\d{4}$/.test(confirm) || (code ? current.length !== 4 : false)
          }
        />
        {code ? (
          <Button
            label={t('parents.codeRemove')}
            icon="trash"
            variant="ghost"
            size="md"
            onPress={remove}
            disabled={current.length !== 4}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 18,
    fontWeight: '600',
  },
  half: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
