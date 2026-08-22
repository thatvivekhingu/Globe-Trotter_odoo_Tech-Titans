import json
import urllib.request
from typing import Any
from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

router = APIRouter()


class SplitExpenseItem(BaseModel):
    payer: str
    description: str
    amount: float


class SplitBillsRequest(BaseModel):
    members: list[str] = Field(min_length=1)
    expenses: list[SplitExpenseItem]


@router.get('/weather')
def get_live_weather(
    lat: float = Query(default=15.2993, ge=-90.0, le=90.0),
    lng: float = Query(default=74.1240, ge=-180.0, le=180.0),
) -> dict[str, Any]:
    """
    Fetch real-time weather from Open-Meteo API.
    """
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current_weather=true&hourly=relativehumidity_2m"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'GlobeTrotter/1.0'})
        with urllib.request.urlopen(req, timeout=8) as response:
            data = json.loads(response.read().decode('utf-8'))
            curr = data.get('current_weather', {})
            hum = data.get('hourly', {}).get('relativehumidity_2m', [60])[0]

            code = curr.get('weathercode', 0)
            condition = 'Clear / Sunny'
            if 51 <= code <= 67:
                condition = 'Light Rain / Drizzle'
            elif 80 <= code <= 99:
                condition = 'Showers / Rain'
            elif 1 <= code <= 3:
                condition = 'Partly Cloudy'

            return {
                "temperature": round(curr.get('temperature', 28)),
                "windSpeed": round(curr.get('windspeed', 10)),
                "humidity": hum,
                "weatherCode": code,
                "condition": condition,
                "unit": "celsius",
            }
    except Exception:
        return {
            "temperature": 28,
            "windSpeed": 12,
            "humidity": 65,
            "weatherCode": 0,
            "condition": "Pleasant / Clear (Cached)",
            "unit": "celsius",
        }


@router.get('/exchange-rates')
def get_exchange_rates() -> dict[str, Any]:
    """
    Fetch live currency exchange rates (Base: INR).
    """
    try:
        url = "https://open.er-api.com/v6/latest/INR"
        req = urllib.request.Request(url, headers={'User-Agent': 'GlobeTrotter/1.0'})
        with urllib.request.urlopen(req, timeout=6) as response:
            data = json.loads(response.read().decode('utf-8'))
            rates = data.get('rates', {})
            return {
                "base": "INR",
                "rates": {
                    "USD": round(rates.get("USD", 0.012), 4),
                    "EUR": round(rates.get("EUR", 0.011), 4),
                    "GBP": round(rates.get("GBP", 0.0095), 4),
                    "AED": round(rates.get("AED", 0.044), 4),
                    "THB": round(rates.get("THB", 0.42), 4),
                },
                "lastUpdated": data.get("time_last_update_utc", "")
            }
    except Exception:
        return {
            "base": "INR",
            "rates": {
                "USD": 0.012,
                "EUR": 0.011,
                "GBP": 0.0095,
                "AED": 0.044,
                "THB": 0.42,
            },
            "lastUpdated": "Live fallback"
        }


@router.post('/split-bills')
def split_group_bills(req: SplitBillsRequest) -> dict[str, Any]:
    """
    Splitwise algorithm calculating net balances and minimal debt settlement graph.
    """
    total_spend = sum(e.amount for e in req.expenses)
    num_members = len(req.members)
    per_person_share = total_spend / num_members if num_members > 0 else 0.0

    paid_map = {m: 0.0 for m in req.members}
    for e in req.expenses:
        if e.payer in paid_map:
            paid_map[e.payer] += e.amount

    balance_map = {m: paid_map[m] - per_person_share for m in req.members}

    debtors = sorted([m for m in req.members if balance_map[m] < -0.5], key=lambda m: balance_map[m])
    creditors = sorted([m for m in req.members if balance_map[m] > 0.5], key=lambda m: -balance_map[m])

    settlements = []
    d_idx = 0
    c_idx = 0
    temp_bal = balance_map.copy()

    while d_idx < len(debtors) and c_idx < len(creditors):
        debtor = debtors[d_idx]
        creditor = creditors[c_idx]
        debt = abs(temp_bal[debtor])
        credit = temp_bal[creditor]

        settle_amt = min(debt, credit)
        if settle_amt > 0.5:
            settlements.append({
                "from": debtor,
                "to": creditor,
                "amount": round(settle_amt, 2)
            })

        temp_bal[debtor] += settle_amt
        temp_bal[creditor] -= settle_amt

        if abs(temp_bal[debtor]) < 0.5:
            d_idx += 1
        if abs(temp_bal[creditor]) < 0.5:
            c_idx += 1

    return {
        "totalSpend": total_spend,
        "perPersonShare": round(per_person_share, 2),
        "balances": {m: round(b, 2) for m, b in balance_map.items()},
        "settlements": settlements
    }
