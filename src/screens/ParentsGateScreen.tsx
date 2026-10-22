import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { randInt } from '../engine/adaptive';
import { useI18n } from '../i18n';
import type { ScreenProps } from '../navigation/types';
import { useSettings } from '../store/settings';
import { useTheme } from '../theme';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Screen } from '../ui/Screen';

/**
 * Porte parentale : une multiplication à deux chiffres, difficile pour un
 * enfant de 3-5 ans, immédiate pour un adulte. Après 3 erreurs, verrouillage
 * temporaire de 30 secondes pour éviter le tâtonnement.
 */
export function ParentsGateScreen({ navigation }: ScreenProps<'ParentsGate'>) {
  const { t } = useI18n();
  const { colors, radius, shadow, text, spacing } = useTheme();
  const parentalCode = useSettings((s) => s.parentalCode);
  const useCode = !!parentalCode;

  const [challenge, setChallenge] = useState(() => makeChallenge());
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockSeconds, setLockSeconds] = useState(0);

  useEffect(() => {
    if (lockSeconds <= 0) return;
    const id = setInterval(() => setLockSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [lockSeconds]);

  const validate = useCallback(() => {
    if (lockSeconds > 0) return;
    const valid = useCode ? value === parentalCode : Number(value) === challenge.a * challenge.b;
    if (valid) {
      navigation.replace('Parents');
      return;
    }
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setError(true);
    setValue('');
    if (nextAttempts >= 3) {
      setLockSeconds(30);
      setAttempts(0);
      setChallenge(makeChallenge());
    }
  }, [attempts, challenge, lockSeconds, navigation, parentalCode, useCode, value]);

  const locked = lockSeconds > 0;

  return (
    <Screen scene="calm" tab="parents" header={{ title: t('parents.title') }}>
      <View style={styles.center}>
        <View
          style={[
            styles.card,
            shadow.soft,
            { backgroundColor: colors.surface, borderRadius: radius.xl, borderColor: colors.sand },
          ]}
        >
          <View style={[styles.lockCircle, { backgroundColor: colors.creamDeep }]}>
            <Icon name="lock" size={30} color={colors.coral} />
          </View>
          <Text style={[text.h2, { color: colors.ink, textAlign: 'center' }]}>{t('parents.locked')}</Text>
          <Text style={[text.body, { color: colors.inkSoft, textAlign: 'center' }]}>{t('parents.gateHint')}</Text>

          {useCode ? (
            <Text style={[text.body, { color: colors.inkSoft, textAlign: 'center' }]}>
              {t('parents.gateCode')}
            </Text>
          ) : (
            <>
              <Text style={[text.display, { color: colors.ink, textAlign: 'center', marginVertical: 6 }]}>
                {challenge.a} × {challenge.b}
              </Text>
              <Text style={[text.caption, { color: colors.inkFaint, textAlign: 'center' }]}>
                {t('parents.gateQuestion', { a: challenge.a, b: challenge.b })}
              </Text>
            </>
          )}

          <TextInput
            value={value}
            onChangeText={(next) => {
              setValue(next.replace(/[^0-9]/g, ''));
              setError(false);
            }}
            onSubmitEditing={validate}
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={4}
            editable={!locked}
            accessibilityLabel={useCode ? t('parents.gateCode') : t('parents.gateQuestion', { a: challenge.a, b: challenge.b })}
            secureTextEntry={useCode}
            style={[
              styles.input,
              {
                borderColor: error ? colors.error : colors.sand,
                borderRadius: radius.md,
                color: colors.ink,
                backgroundColor: locked ? colors.creamDeep : colors.surface,
              },
            ]}
          />

          {error && !locked ? (
            <Text style={[text.label, { color: colors.error, textAlign: 'center' }]}>{t('parents.gateError')}</Text>
          ) : null}
          {locked ? (
            <Text style={[text.label, { color: colors.error, textAlign: 'center' }]}>
              {t('parents.lockedHint')} ({lockSeconds}s)
            </Text>
          ) : null}

          <Button
            label={t('common.continue')}
            icon="chevron"
            onPress={validate}
            disabled={locked || (useCode ? value.length !== 4 : value.length === 0)}
            size="lg"
            fullWidth
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </View>
    </Screen>
  );
}

function makeChallenge() {
  return { a: randInt(6, 9), b: randInt(6, 9) };
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 24,
    gap: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  lockCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: 160,
    height: 64,
    borderWidth: 2,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 6,
  },
});
