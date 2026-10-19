#!/usr/bin/env python3
"""
Génère les effets sonores « Montessori Club » (WAV 44,1 kHz mono 16 bits).

Aucune dépendance externe : uniquement la bibliothèque standard.
Les sons sont volontairement doux (attaque progressive, décroissance
exponentielle, pas d'aigu agressif) pour respecter l'oreille des jeunes enfants.

Usage :
    python3 tools/generate_sounds.py
"""

from __future__ import annotations

import math
import os
import struct
import wave

RATE = 44_100
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "sounds")


def envelope(i: int, total: int, attack: float = 0.008, release: float = 0.6) -> float:
    """Enveloppe douce : montée linéaire courte puis décroissance exponentielle."""
    t = i / RATE
    dur = total / RATE
    a = min(1.0, t / attack) if attack > 0 else 1.0
    r = math.exp(-(t / max(dur * release, 1e-3)) * 3.2)
    return a * r


def tone(freq: float, dur: float, volume: float = 0.5, harmonics=(1.0, 0.25, 0.08), vibrato=0.0) -> list[float]:
    """Note sinusoïdale avec harmoniques douces (timbre proche du marimba)."""
    total = int(RATE * dur)
    out = []
    for i in range(total):
        t = i / RATE
        phase = 2 * math.pi * freq * t
        if vibrato:
            phase += math.sin(2 * math.pi * 5.2 * t) * vibrato
        sample = sum(h * math.sin(phase * (k + 1)) for k, h in enumerate(harmonics))
        out.append(sample * volume * envelope(i, total))
    return out


def sweep(f0: float, f1: float, dur: float, volume: float = 0.5) -> list[float]:
    """Glissando (effet « bulle qui éclate »)."""
    total = int(RATE * dur)
    out = []
    phase = 0.0
    for i in range(total):
        t = i / RATE
        ratio = i / max(total - 1, 1)
        freq = f0 * (f1 / f0) ** ratio
        phase += 2 * math.pi * freq / RATE
        out.append(math.sin(phase) * volume * envelope(i, total, attack=0.004, release=0.35))
    return out


def mix(layers: list[tuple[list[float], float]]) -> list[float]:
    """Superpose des pistes avec un décalage en secondes."""
    total = 0
    for track, offset in layers:
        total = max(total, int(offset * RATE) + len(track))
    out = [0.0] * total
    for track, offset in layers:
        start = int(offset * RATE)
        for i, value in enumerate(track):
            out[start + i] += value
    return out


def normalize(samples: list[float], peak: float = 0.62) -> list[float]:
    maximum = max((abs(s) for s in samples), default=1.0) or 1.0
    return [s / maximum * peak for s in samples]


def write_wav(name: str, samples: list[float]) -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, f"{name}.wav")
    data = b"".join(struct.pack("<h", int(max(-1.0, min(1.0, s)) * 32767)) for s in samples)
    with wave.open(path, "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(RATE)
        handle.writeframes(data)
    print(f"  ✓ {path} ({len(samples) / RATE:.2f}s)")


def main() -> None:
    print("Génération des effets sonores…")

    # Toucher léger : petit « toc » rond.
    write_wav("tap", normalize(tone(660, 0.09, harmonics=(1.0, 0.18), vibrato=0.02), 0.42))

    # Objet déposé : note de marimba chaleureuse.
    write_wav("drop", normalize(tone(523.25, 0.28, harmonics=(1.0, 0.3, 0.1)), 0.55))

    # Bulle qui éclate : glissando descendant très court.
    write_wav("pop", normalize(sweep(1100, 320, 0.1), 0.5))

    # Réussite : arpège do–mi–sol.
    write_wav(
        "success",
        normalize(
            mix(
                [
                    (tone(523.25, 0.32), 0.0),
                    (tone(659.25, 0.32), 0.09),
                    (tone(783.99, 0.5), 0.18),
                ]
            ),
            0.58,
        ),
    )

    # Encouragement doux (erreur) : deux notes descendantes, jamais dissonantes.
    write_wav(
        "error",
        normalize(
            mix(
                [
                    (tone(392.00, 0.2, harmonics=(1.0, 0.15)), 0.0),
                    (tone(329.63, 0.3, harmonics=(1.0, 0.15)), 0.13),
                ]
            ),
            0.34,
        ),
    )

    # Étoile gagnée : « ding » cristallin.
    write_wav("star", normalize(mix([(tone(1046.5, 0.45), 0.0), (tone(1568.0, 0.3), 0.05)]), 0.4))

    # Niveau supérieur : montée joyeuse do–mi–sol–do.
    write_wav(
        "levelup",
        normalize(
            mix(
                [
                    (tone(523.25, 0.3), 0.0),
                    (tone(659.25, 0.3), 0.1),
                    (tone(783.99, 0.3), 0.2),
                    (tone(1046.50, 0.55), 0.3),
                ]
            ),
            0.55,
        ),
    )

    # Fin de session : petite fanfare chaleureuse.
    write_wav(
        "celebrate",
        normalize(
            mix(
                [
                    (tone(523.25, 0.3), 0.0),
                    (tone(523.25, 0.3), 0.14),
                    (tone(659.25, 0.3), 0.28),
                    (tone(783.99, 0.35), 0.42),
                    (tone(1046.50, 0.7), 0.56),
                    (tone(1318.51, 0.6), 0.7),
                ]
            ),
            0.6,
        ),
    )

    print("Terminé.")


if __name__ == "__main__":
    main()
