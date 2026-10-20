/** Types partagés entre les modules de jeu. */

/** Statistiques d'une session interrompue par l'enfant. */
export type PartialSession = { stars: number; mistakes: number; rounds: number };

export type RoundResult = {
  /** Nombre d'erreurs (auto-corrigées) pendant la manche. */
  mistakes: number;
  /** Nombre de défis de la manche. */
  rounds: number;
};

export interface GameProps {
  /** Niveau courant 1..maxLevel (fourni par le moteur adaptatif). */
  level: number;
  /** Appelé à la fin d'une session de jeu. */
  onFinish: (result: RoundResult) => void;
  /** Appelé à chaque erreur pour que l'écran parent puisse encourager. */
  onMistake?: () => void;
  /** Quitter l'activité sans terminer la session (bouton retour). */
  onQuit?: (partial: PartialSession) => void;
}

export type AgeBandId = '0-2' | '3-5' | '6-8' | '9-12';

export interface GameModule {
  id: string;
  /** Clés de traduction : activity.<id>.title / .instruction */
  titleKey: string;
  instructionKey: string;
  emoji: string;
  accent: string;
  ageBands: AgeBandId[];
  /**
   * Niveau minimal proposé selon la tranche d'âge.
   * Permet d'utiliser une activité qui couvre deux tranches sans imposer aux
   * plus grands les premiers niveaux, trop faciles pour eux.
   */
  minLevelByAge?: Partial<Record<AgeBandId, number>>;
  maxLevel: number;
  /** Nombre de défis par session. */
  rounds: number;
  Component: React.ComponentType<GameProps>;
}
