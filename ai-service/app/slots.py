from typing import List
from app.session import Slots
from app.query_parse import parse_city, parse_category, parse_budget


CRITICAL = ("category", "city")


def extract_slots_from_text(text: str) -> Slots:
    c = parse_category(text)
    city = parse_city(text)
    bmin, bmax = parse_budget(text)
    return Slots(category=c, city=city, budget_min=bmin, budget_max=bmax)


def missing_critical(slots: Slots, ask_for_budget: bool) -> List[str]:
    missing: List[str] = []
    if not slots.category:
        missing.append("category")
    if not slots.city:
        missing.append("city")
    if ask_for_budget and (slots.budget_min is None and slots.budget_max is None):
        missing.append("budget")
    return missing


def build_clarifying_question(missing: List[str]) -> str:
    need = []
    if "category" in missing:
        need.append("kategoria (np. fotograf, DJ)")
    if "city" in missing:
        need.append("miasto")
    if "budget" in missing:
        need.append("budżet")
    need_str = ", ".join(need)
    return f"Potrzebuję jeszcze: {need_str}. Jakie są te informacje?"


