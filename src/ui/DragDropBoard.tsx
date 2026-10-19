import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type LayoutRectangle,
} from 'react-native';

import { useI18n } from '../i18n';
import { useTheme } from '../theme';

export interface BoardItem {
  id: string;
  /** Clé de correspondance avec la corbeille visée. */
  matchKey: string;
  label: string;
  render: (size: number) => React.ReactNode;
}

export interface BoardBin {
  id: string;
  matchKey: string;
  label: string;
  color: string;
  /** Emplacement vide (contour pointillé). */
  renderEmpty: (size: number) => React.ReactNode;
  placed: { id: string; render: (size: number) => React.ReactNode }[];
  /** Symbole d'accessibilité (mode daltonisme) affiché à côté du libellé. */
  labelBadge?: React.ReactNode;
}

interface DragDropBoardProps {
  items: BoardItem[];
  bins: BoardBin[];
  onDrop: (itemId: string, binId: string, correct: boolean) => void;
  disabled?: boolean;
  /** Taille maximale d'un objet. */
  maxItemSize?: number;
}

type Rect = LayoutRectangle;
type DropOutcome = { binId: string; correct: boolean; center: { x: number; y: number } };

/**
 * Plateau de manipulation Montessori :
 *  - glisser-déposer au doigt (PanResponder + Animated, compatible web) ;
 *  - repli accessibilité « toucher l'objet puis toucher la corbeille » ;
 *  - auto-correction immédiate, sans pénalité.
 */
export function DragDropBoard({ items, bins, onDrop, disabled, maxItemSize = 116 }: DragDropBoardProps) {
  const { colors, radius, shadow, text } = useTheme();
  const { t } = useI18n();
  const { width } = useWindowDimensions();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const binRects = useRef<Record<string, Rect>>({});
  const binRefs = useRef<Record<string, React.ComponentRef<typeof View> | null>>({});

  const columns = Math.min(Math.max(items.length, 1), 4);
  const itemSize = Math.max(
    58,
    Math.min(maxItemSize, Math.floor((Math.min(width, 1080) - 56 - (columns - 1) * 12) / columns))
  );

  const measureBins = useCallback(() => {
    bins.forEach((bin) => {
      const node = binRefs.current[bin.id];
      if (node && typeof node.measureInWindow === 'function') {
        node.measureInWindow((x, y, w, h) => {
          if (w > 0 && h > 0) binRects.current[bin.id] = { x, y, width: w, height: h };
        });
      }
    });
  }, [bins]);

  useEffect(() => {
    const id = setTimeout(measureBins, 60);
    return () => clearTimeout(id);
  }, [measureBins, items.length]);

  const resolveDrop = useCallback(
    (itemId: string, point: { x: number; y: number }): DropOutcome | null => {
      for (const bin of bins) {
        const rect = binRects.current[bin.id];
        if (!rect) continue;
        const tolX = 18;
        const tolY = 26;
        const inside =
          point.x >= rect.x - tolX &&
          point.x <= rect.x + rect.width + tolX &&
          point.y >= rect.y - tolY &&
          point.y <= rect.y + rect.height + tolY;
        if (inside) {
          const item = items.find((i) => i.id === itemId);
          return {
            binId: bin.id,
            correct: !!item && item.matchKey === bin.matchKey,
            center: { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 },
          };
        }
      }
      return null;
    },
    [bins, items]
  );

  const handleBinPress = (bin: BoardBin) => {
    if (!selectedId) return;
    const item = items.find((i) => i.id === selectedId);
    if (!item) return;
    setSelectedId(null);
    onDrop(item.id, bin.id, item.matchKey === bin.matchKey);
  };

  return (
    <View style={styles.root}>
      {/* Zone des objets à déplacer */}
      <View style={[styles.itemsZone, { minHeight: itemSize + 16 }]}>
        {items.map((item) => (
          <DraggableItem
            key={item.id}
            item={item}
            size={itemSize}
            disabled={!!disabled}
            selected={selectedId === item.id}
            onSelect={() => setSelectedId((current) => (current === item.id ? null : item.id))}
            onDragStart={measureBins}
            resolveDrop={resolveDrop}
            onSettle={onDrop}
          />
        ))}
        {items.length === 0 ? (
          <View style={{ height: itemSize }} />
        ) : null}
      </View>

      <Text style={[text.caption, styles.hint, { color: colors.inkFaint }]}>{t('game.dragHint')}</Text>

      {/* Corbeilles / emplacements */}
      <View style={styles.binsRow}>
        {bins.map((bin) => {
          const isTarget = selectedId !== null;
          return (
            <Pressable
              key={bin.id}
              ref={(node) => {
                binRefs.current[bin.id] = node;
              }}
              onLayout={() => setTimeout(measureBins, 0)}
              onPress={() => handleBinPress(bin)}
              accessibilityRole="button"
              accessibilityLabel={bin.label}
              accessibilityHint={t('a11y.dropTarget', { name: bin.label })}
              style={[
                styles.bin,
                shadow.soft,
                {
                  backgroundColor: `${bin.color}14`,
                  borderColor: isTarget ? bin.color : `${bin.color}55`,
                  borderRadius: radius.lg,
                  opacity: disabled ? 0.6 : 1,
                  transform: [{ scale: isTarget ? 1.02 : 1 }],
                },
              ]}
            >
              <View style={[styles.binContent, { minHeight: 64 }]}>
                {bin.placed.length === 0 ? (
                  bin.renderEmpty(60)
                ) : (
                  bin.placed.map((placed) => (
                    <View key={placed.id} style={styles.placed}>
                      {placed.render(46)}
                    </View>
                  ))
                )}
              </View>
              <View style={[styles.binLabel, { backgroundColor: bin.color }]}>
                <View style={styles.binLabelRow}>
                  {bin.labelBadge}
                  <Text style={[text.label, { color: '#FFFFFF', flexShrink: 1 }]} numberOfLines={1}>
                    {bin.label}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

interface DraggableItemProps {
  item: BoardItem;
  size: number;
  disabled: boolean;
  selected: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  resolveDrop: (itemId: string, point: { x: number; y: number }) => DropOutcome | null;
  onSettle: (itemId: string, binId: string, correct: boolean) => void;
}

function DraggableItem({
  item,
  size,
  disabled,
  selected,
  onSelect,
  onDragStart,
  resolveDrop,
  onSettle,
}: DraggableItemProps) {
  const { colors, radius, shadow, reducedMotion } = useTheme();
  const { t } = useI18n();
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const lift = useRef(new Animated.Value(0)).current;
  const viewRef = useRef<React.ComponentRef<typeof View> | null>(null);
  const startRect = useRef<Rect | null>(null);
  const didMove = useRef(false);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: (_, g) => !disabled && (Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4),
        onPanResponderGrant: () => {
          didMove.current = false;
          onDragStart();
          const node = viewRef.current;
          if (node) {
            node.measureInWindow((x, y, width, height) => {
              startRect.current = { x, y, width, height };
            });
          }
          Animated.spring(lift, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
        },
        onPanResponderMove: (_, g) => {
          if (Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6) didMove.current = true;
          pan.setValue({ x: g.dx, y: g.dy });
        },
        onPanResponderRelease: (_, g) => {
          Animated.spring(lift, { toValue: 0, useNativeDriver: true, speed: 30, bounciness: 6 }).start();

          if (!didMove.current || !startRect.current) {
            pan.setValue({ x: 0, y: 0 });
            onSelect();
            return;
          }

          const start = startRect.current;
          const point = {
            x: start.x + start.width / 2 + g.dx,
            y: start.y + start.height / 2 + g.dy,
          };
          const outcome = resolveDrop(item.id, point);

          if (!outcome) {
            // Déposé dans le vide : retour doux, aucun message d'échec.
            Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, speed: 34, bounciness: 12 }).start();
            return;
          }

          if (outcome.correct) {
            const targetX = outcome.center.x - (start.x + start.width / 2);
            const targetY = outcome.center.y - (start.y + start.height / 2);
            Animated.timing(pan, {
              toValue: { x: targetX, y: targetY },
              duration: reducedMotion ? 0 : 230,
              useNativeDriver: false,
            }).start(() => onSettle(item.id, outcome.binId, true));
            Animated.timing(lift, {
              toValue: -0.5,
              duration: 230,
              useNativeDriver: true,
            }).start();
          } else {
            Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, speed: 26, bounciness: 14 }).start();
            onSettle(item.id, outcome.binId, false);
          }
        },
        onPanResponderTerminate: () => {
          pan.setValue({ x: 0, y: 0 });
        },
      }),
    [disabled, item.id, lift, onDragStart, onSelect, onSettle, pan, reducedMotion, resolveDrop]
  );

  const scale = lift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const rotate = lift.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-3deg'] });

  return (
    <Animated.View
      ref={viewRef}
      {...responder.panHandlers}
      accessible
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityHint={t('a11y.dragItem', { name: item.label })}
      accessibilityState={{ selected }}
      accessibilityActions={[{ name: 'activate', label: item.label }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'activate') onSelect();
      }}
      style={[
        styles.item,
        shadow.lifted,
        {
          width: size,
          height: size,
          borderRadius: radius.md,
          backgroundColor: '#FFFFFF',
          borderColor: selected ? colors.coral : colors.sand,
          borderWidth: selected ? 3 : 1.5,
          transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale }, { rotate }],
          zIndex: 10,
        },
      ]}
    >
      {item.render(size - 16)}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: 8,
  },
  itemsZone: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 4,
    maxWidth: 760,
    alignSelf: 'center',
    width: '100%',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    textAlign: 'center',
    marginBottom: 6,
  },
  binsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 12,
    paddingBottom: 4,
  },
  bin: {
    flexGrow: 1,
    flexBasis: 130,
    maxWidth: 230,
    minWidth: 116,
    borderWidth: 2,
    padding: 8,
    alignItems: 'center',
    gap: 8,
  },
  binContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    width: '100%',
  },
  placed: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  binLabel: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    maxWidth: '100%',
  },
  binLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
});
