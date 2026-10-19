import { useCallback, useRef, useState } from 'react';

import type { RoundResult } from './types';

export type SessionPhase = 'play' | 'roundWon' | 'done';

interface UseGameSessionOptions {
  rounds: number;
  onFinish: (result: RoundResult) => void;
}

/**
 * Boucle de session commune à tous les jeux :
 * manches, réussites, erreurs (jamais bloquantes), étoiles et fin de session.
 */
export function useGameSession({ rounds, onFinish }: UseGameSessionOptions) {
  const [round, setRound] = useState(1);
  const [mistakes, setMistakes] = useState(0);
  const [starsEarned, setStarsEarned] = useState(0);
  const [fireKey, setFireKey] = useState(0);
  const [phase, setPhase] = useState<SessionPhase>('play');

  // Les valeurs courantes sont dupliquées en ref pour éviter les fermetures
  // obsolètes lors des rappels de boutons.
  const roundRef = useRef(round);
  roundRef.current = round;
  const mistakesRef = useRef(mistakes);
  mistakesRef.current = mistakes;
  const finishedRef = useRef(false);

  const celebrate = useCallback(() => {
    setStarsEarned((s) => s + 1);
    setFireKey((k) => k + 1);
  }, []);

  const registerMistake = useCallback(() => {
    setMistakes((m) => m + 1);
  }, []);

  const winRound = useCallback(() => {
    setPhase('roundWon');
  }, []);

  const goNextRound = useCallback(() => {
    if (roundRef.current >= rounds) {
      if (!finishedRef.current) {
        finishedRef.current = true;
        setPhase('done');
        onFinish({ mistakes: mistakesRef.current, rounds });
      }
      return;
    }
    setRound((r) => r + 1);
    setPhase('play');
  }, [onFinish, rounds]);

  return {
    round,
    rounds,
    starsEarned,
    mistakes,
    fireKey,
    phase,
    celebrate,
    registerMistake,
    winRound,
    goNextRound,
    isLastRound: round >= rounds,
  };
}
