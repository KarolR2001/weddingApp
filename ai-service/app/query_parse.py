import re
from typing import Optional, Tuple


def parse_budget(msg: str) -> Tuple[Optional[int], Optional[int]]:
    m = re.search(r"(\d+)\s*[-–]\s*(\d+)", msg)
    if m:
        lo, hi = int(m.group(1)), int(m.group(2))
        if lo > hi:
            lo, hi = hi, lo
        return lo, hi
    m = re.search(r"\bdo\s*(\d+)\b", msg, re.IGNORECASE)
    if m:
        return None, int(m.group(1))
    m = re.search(r"\bod\s*(\d+)\b", msg, re.IGNORECASE)
    if m:
        return int(m.group(1)), None
    m = re.search(r"\b(\d{3,5})\s*(zł|pln)?\b", msg, re.IGNORECASE)
    if m:
        return None, int(m.group(1))
    return None, None


def parse_city(msg: str) -> Optional[str]:
    tokens = re.findall(r"[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźżA-ZĄĆĘŁŃÓŚŹŻ-]+", msg)
    for t in tokens:
        if t.lower() in {"szukam", "potrzebuję", "dj", "fotograf", "kamerzysta"}:
            continue
        return t
    return None


def parse_category(msg: str) -> Optional[str]:
    text = msg.lower()
    # Prosty słownik słów‑kluczy → etykieta (na potrzeby slotów; filtr po kategorii może być pominięty)
    mapping = {
        "fotograf": "fotograf",
        "foto": "fotograf",
        "kamerzysta": "kamerzysta",
        "kamera": "kamerzysta",
        "wideofilm": "kamerzysta",
        "dj": "dj",
        "zespół": "zespół",
        "zespol": "zespół",
        "muzyka": "zespół",
        "sala": "sala",
        "dekorac": "dekoracje",
        "kwiat": "kwiaty",
    }
    for key, label in mapping.items():
        if key in text:
            return label
    return None


