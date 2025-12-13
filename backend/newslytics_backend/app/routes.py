from datetime import date, datetime, timedelta
from flask import Blueprint, request, jsonify, abort
from sqlalchemy import or_
import requests
import yfinance as yf

from .models import (
    db,
    User,
    Portfolio,
    Aktie,
    Watchlist,
    Transaktion,
    Chatverlauf,
    ChatEntry,
    ChatTypeEnum,
    SenderEnum,
)

from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (

    create_access_token,
    jwt_required,
    get_jwt_identity,
)

api_bp = Blueprint("api", __name__)

# ------- Simple In-Memory Caches -------

# Kursdaten-Caching (historische Marketdata)
MARKETDATA_CACHE = {}  # Key: (symbol, period, interval) -> {"expires_at": datetime, "payload": dict}

# Company-/Ticker-Info-Caching (inkl. ISIN etc.)
COMPANYINFO_CACHE = {}  # Key: symbol -> {"expires_at": datetime, "info": dict}

# Trending-Listen-Caching
TRENDING_CACHE = {}  # Key: region -> {"expires_at": datetime, "quotes": list}


def _now_utc():
    return datetime.utcnow()


def get_company_info_cached(symbol: str, ttl_seconds: int = 3600):
    """
    Holt Company-Info aus Cache oder via yfinance.Ticker.
    Wird von /companyinfo, /aktie/search und /aktie/trending verwendet.
    """
    now = _now_utc()
    entry = COMPANYINFO_CACHE.get(symbol)
    if entry and entry["expires_at"] > now:
        return entry["info"]

    # Neu von yfinance holen
    ticker = yf.Ticker(symbol)

    info = {}
    if hasattr(ticker, "info") and isinstance(ticker.info, dict):
        info = ticker.info or {}
    else:
        basic = getattr(ticker, "basic_info", {}) or {}
        fast = getattr(ticker, "fast_info", {}) or {}
        info = {**basic, **fast}

    COMPANYINFO_CACHE[symbol] = {
        "info": info,
        "expires_at": now + timedelta(seconds=ttl_seconds),
    }
    return info

# ------- Helper -------

def get_json():
    if not request.is_json:
        abort(400, description="Request must be JSON")
    return request.get_json()

# ======================
#        Auth (LOGIN Register)
# ======================
@api_bp.route("/auth/register", methods=["POST"])
def register():
    data = get_json()

    required_fields = ["username", "firstname", "lastname", "password"]
    missing = [f for f in required_fields if f not in data]
    if missing:
        abort(400, description=f"Missing fields: {', '.join(missing)}")

    # Username darf nicht doppelt sein
    if User.query.filter_by(username=data["username"]).first() is not None:
        abort(400, description="Username already taken")

    user = User(
        username=data["username"],
        firstname=data["firstname"],
        lastname=data["lastname"],
    )

    user.password = generate_password_hash(data["password"])

    db.session.add(user)
    db.session.commit()

    return jsonify(user.to_dict()), 201


@api_bp.route("/auth/login", methods=["POST"])
def login():
    data = get_json()

    if "username" not in data or "password" not in data:
        abort(400, description="Username and password are required")

    user = User.query.filter_by(username=data["username"]).first()
    if user is None:
        abort(401, description="Invalid credentials")

    # Passwort prüfen
    if not check_password_hash(user.password, data["password"]):
        # oder: if not user.check_password(data["password"]):
        abort(401, description="Invalid credentials")

    # JWT generieren, Identity = user.id
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "access_token": access_token,
        "user": user.to_dict(),
    }), 200


@api_bp.route("/auth/me", methods=["GET"])
@jwt_required()
def me():
    current_user_id = int(get_jwt_identity())
    user = User.query.get_or_404(current_user_id)
    return jsonify(user.to_dict()), 200


# ======================
#        USERS
# ======================
@api_bp.route("/users", methods=["GET", "POST"])
@jwt_required()
def users_collection():
    if request.method == "POST":
        data = get_json()
        user = User(
            username=data["username"],
            firstname=data["firstname"],
            lastname=data["lastname"],
        )
        # Passwort hashen:
        user.password = generate_password_hash(data["password"])
        # oder: user.set_password(data["password"])

        db.session.add(user)
        db.session.commit()
        return jsonify(user.to_dict()), 201

    users = User.query.all()
    return jsonify([u.to_dict() for u in users])



@api_bp.route("/users/<int:user_id>", methods=["GET", "DELETE"])
@jwt_required()
def user_detail(user_id):
    user = User.query.get_or_404(user_id)

    if request.method == "GET":
        return jsonify(user.to_dict())

    # DELETE
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"User {user_id} deleted"}), 200


# ======================
#      PORTFOLIOS
# ======================

@api_bp.route("/portfolios", methods=["GET", "POST"])
@jwt_required()
def portfolios_collection():
    if request.method == "POST":
        data = get_json()
        portfolio = Portfolio(
            name=data["name"],
            user_id=data["user_id"],
        )
        db.session.add(portfolio)
        db.session.commit()
        return jsonify(portfolio.to_dict()), 201

    portfolios = Portfolio.query.all()
    return jsonify([p.to_dict() for p in portfolios])

@api_bp.route("/portfolios/<int:portfolio_id>", methods=["PUT"])
@jwt_required()
def update_portfolio(portfolio_id):
    data = get_json()

    # Portfolio suchen
    portfolio = Portfolio.query.get_or_404(portfolio_id)

    # Sicherstellen, dass der eingeloggte Benutzer nur seine eigenen Portfolios ändert
    current_user_id = int(get_jwt_identity())
    if portfolio.user_id != current_user_id:
        return jsonify({"error": "Not authorized - Not your portfolio."}), 403

    if "name" in data:
        portfolio.name = data["name"]

    db.session.commit()

    return jsonify(portfolio.to_dict()), 200

@api_bp.route("/portfolios/<int:portfolio_id>", methods=["GET", "DELETE"])
@jwt_required()
def portfolio_detail(portfolio_id):
    portfolio = Portfolio.query.get_or_404(portfolio_id)

    if request.method == "GET":
        return jsonify(portfolio.to_dict())

    # DELETE
    db.session.delete(portfolio)
    db.session.commit()
    return jsonify({"message": f"Portfolio {portfolio_id} deleted"}), 200


@api_bp.route("/users/<int:user_id>/portfolios", methods=["GET"])
@jwt_required()
def portfolios_of_user(user_id):
    # 404, falls User nicht existiert
    User.query.get_or_404(user_id)

    portfolios = Portfolio.query.filter_by(user_id=user_id).all()
    return jsonify([p.to_dict() for p in portfolios])


# ======================
#        AKTIEN
# ======================

@api_bp.route("/aktien", methods=["GET", "POST"])
@jwt_required()
def aktien_collection():
    if request.method == "POST":
        data = get_json()
        aktie = Aktie(
            name=data["name"],
            isin=data["isin"],
            firma=data.get("firma", ""),
            ausschüttungsart=data.get("ausschüttungsart"),
            kategorie=data.get("kategorie"),
            land=data.get("land"),
            beschreibung=data.get("beschreibung"),
            ebitda=data.get("ebitda"),
            nettogewinn=data.get("nettogewinn"),
            umsatz=data.get("umsatz"),
            currency=data.get("currency"),
            unternehmenswert=data.get("unternehmenswert"),
        )
        db.session.add(aktie)
        db.session.commit()
        return jsonify(aktie.to_dict()), 201

    aktien = Aktie.query.all()
    return jsonify([a.to_dict() for a in aktien])

@api_bp.route("/aktien/<int:aktie_id>", methods=["PUT"])
@jwt_required()
def update_aktie(aktie_id):
    data = get_json()

    # Aktie laden oder 404
    aktie = Aktie.query.get_or_404(aktie_id)

    # Alle optionalen Felder updaten, falls vorhanden
    if "name" in data:
        aktie.name = data["name"]
    if "isin" in data:
        aktie.isin = data["isin"]
    if "firma" in data:
        aktie.firma = data["firma"]
    if "ausschüttungsart" in data:
        aktie.ausschüttungsart = data["ausschüttungsart"]
    if "kategorie" in data:
        aktie.kategorie = data["kategorie"]
    if "land" in data:
        aktie.land = data["land"]
    if "beschreibung" in data:
        aktie.beschreibung = data["beschreibung"]
    if "ebitda" in data:
        aktie.ebitda = data["ebitda"]
    if "nettogewinn" in data:
        aktie.nettogewinn = data["nettogewinn"]
    if "umsatz" in data:
        aktie.umsatz = data["umsatz"]
    if "currency" in data:
        aktie.currency = data["currency"]
    if "unternehmenswert" in data:
        aktie.unternehmenswert = data["unternehmenswert"]

    db.session.commit()

    return jsonify(aktie.to_dict()), 200

@api_bp.route("/aktien/<int:aktie_id>", methods=["GET", "DELETE"])
@jwt_required()
def aktie_detail(aktie_id):
    aktie = Aktie.query.get_or_404(aktie_id)

    if request.method == "GET":
        return jsonify(aktie.to_dict())

    # DELETE
    db.session.delete(aktie)
    db.session.commit()
    return jsonify({"message": f"Aktie {aktie_id} deleted"}), 200


# ======================
#       WATCHLIST
# ======================

@api_bp.route("/watchlist", methods=["GET", "POST"])
@jwt_required()
def watchlist_collection():
    if request.method == "POST":
        data = get_json()
        entry = Watchlist(
            user_id=data["user_id"],
            aktie_id=data["aktie_id"],
        )
        db.session.add(entry)
        db.session.commit()
        return jsonify(entry.to_dict()), 201

    entries = Watchlist.query.all()
    return jsonify([e.to_dict() for e in entries])


@api_bp.route("/watchlist/<int:entry_id>", methods=["DELETE"])
@jwt_required()
def watchlist_detail(entry_id):
    entry = Watchlist.query.get_or_404(entry_id)
    db.session.delete(entry)
    db.session.commit()
    return jsonify({"message": f"Watchlist entry {entry_id} deleted"}), 200


@api_bp.route("/watchlist/user/<int:user_id>", methods=["GET"])
@jwt_required()
def watchlist_of_user(user_id):
    # 404, falls User nicht existiert
    User.query.get_or_404(user_id)

    entries = Watchlist.query.filter_by(user_id=user_id).all()
    return jsonify([e.to_dict() for e in entries])


# ======================
#     TRANSAKTIONEN
# ======================

@api_bp.route("/transaktionen", methods=["GET", "POST"])
@jwt_required()
def transaktionen_collection():
    if request.method == "POST":
        data = get_json()

        kaufdatum = date.fromisoformat(data["kaufdatum"])

        tx = Transaktion(
            menge=data["menge"],
            kaufpreis=data["kaufpreis"],
            kaufdatum=kaufdatum,
            aktie_id=data["aktie_id"],
            portfolio_id=data["portfolio_id"],
        )
        db.session.add(tx)
        db.session.commit()
        return jsonify(tx.to_dict()), 201

    txs = Transaktion.query.all()
    return jsonify([t.to_dict() for t in txs])

@api_bp.route("/transaktionen/<int:tx_id>", methods=["PUT"])
@jwt_required()
def update_transaktion(tx_id):
    data = get_json()

    # Transaktion finden oder 404
    tx = Transaktion.query.get_or_404(tx_id)

    # Der User darf nur Transaktionen in seinen eigenen Portfolios bearbeiten
    current_user_id = int(get_jwt_identity())
    if tx.portfolio.user_id != current_user_id:
        return jsonify({"error": "Not authorized - Not your transaction."}), 403

    # Felder aktualisieren, falls im Request enthalten
    if "menge" in data:
        tx.menge = data["menge"]

    if "kaufpreis" in data:
        tx.kaufpreis = data["kaufpreis"]

    if "kaufdatum" in data:
        tx.kaufdatum = date.fromisoformat(data["kaufdatum"])

    if "aktie_id" in data:
        tx.aktie_id = data["aktie_id"]

    if "portfolio_id" in data:
        tx.portfolio_id = data["portfolio_id"]

    db.session.commit()

    return jsonify(tx.to_dict()), 200

@api_bp.route("/transaktionen/<int:tx_id>", methods=["DELETE"])
@jwt_required()
def transaktion_detail(tx_id):
    tx = Transaktion.query.get_or_404(tx_id)
    db.session.delete(tx)
    db.session.commit()
    return jsonify({"message": f"Transaktion {tx_id} deleted"}), 200


@api_bp.route("/portfolios/<int:portfolio_id>/transaktionen", methods=["GET"])
@jwt_required()
def transaktionen_of_portfolio(portfolio_id):
    # 404, falls Portfolio nicht existiert
    Portfolio.query.get_or_404(portfolio_id)

    txs = Transaktion.query.filter_by(portfolio_id=portfolio_id).all()
    return jsonify([t.to_dict() for t in txs])


# ======================
#        CHATS
# ======================

@api_bp.route("/chats", methods=["GET", "POST"])
@jwt_required()
def chats_collection():
    if request.method == "POST":
        data = get_json()
        chat_type = ChatTypeEnum(data["type"])
        chat = Chatverlauf(
            type=chat_type,
            foreign_id=data["foreign_id"],
            user_id=data["user_id"],
        )
        db.session.add(chat)
        db.session.commit()
        return jsonify(chat.to_dict()), 201

    chats = Chatverlauf.query.all()
    return jsonify([c.to_dict() for c in chats])


@api_bp.route("/chats/<int:chat_id>", methods=["DELETE"])
@jwt_required()
def chat_detail(chat_id):
    chat = Chatverlauf.query.get_or_404(chat_id)
    db.session.delete(chat)
    db.session.commit()
    return jsonify({"message": f"Chat {chat_id} deleted"}), 200


# ======================
#      CHAT ENTRIES
# ======================

@api_bp.route("/chats/<int:chat_id>/entries", methods=["GET", "POST"])
@jwt_required()
def chat_entries_collection(chat_id):
    chat = Chatverlauf.query.get_or_404(chat_id)

    if request.method == "POST":
        data = get_json()
        sender = SenderEnum(data["sender"])
        entry = ChatEntry(
            chat=chat,
            sender=sender,
            text=data["text"],
        )
        db.session.add(entry)
        db.session.commit()
        return jsonify(entry.to_dict()), 201

    entries = ChatEntry.query.filter_by(chat_id=chat_id).order_by(ChatEntry.datetime).all()
    return jsonify([e.to_dict() for e in entries])


@api_bp.route("/chats/<int:chat_id>/entries/<int:entry_id>", methods=["DELETE"])
@jwt_required()
def chat_entry_detail(chat_id, entry_id):
    # sicherstellen, dass Chat existiert
    Chatverlauf.query.get_or_404(chat_id)

    entry = ChatEntry.query.filter_by(id=entry_id, chat_id=chat_id).first()
    if entry is None:
        abort(404, description="Chat entry not found")

    db.session.delete(entry)
    db.session.commit()
    return jsonify({"message": f"Chat entry {entry_id} in chat {chat_id} deleted"}), 200


@api_bp.route("/chatbot/stock", methods=["POST"])
def chatbot_stock_assistant():
    data = get_json()
    message = (data.get("message") or "").strip()
    stock_payload = data.get("stock") or {}
    history = data.get("history") or []

    if not message:
        abort(400, description="Field 'message' is required")

    symbol = (
        stock_payload.get("symbol")
        or stock_payload.get("ticker")
        or stock_payload.get("isin")
        or "dieser Aktie"
    )
    display_name = (
        stock_payload.get("name")
        or stock_payload.get("shortName")
        or stock_payload.get("longName")
        or symbol
    )

    # Dummy response that references latest user input and current stock context
    summary_hint = "" if not history else " Ich berücksichtige den bisherigen Verlauf."
    stock_descriptor = f"{display_name} ({symbol})" if display_name != symbol else display_name
    reply = (
        f"Zu {stock_descriptor}: Ich kann dir einen allgemeinen Hinweis geben. "
        f"Deine Frage war: '{message}'.{summary_hint}"
    )

    return jsonify({
        "reply": reply,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }), 200


# ======================
#      Market-Data
# ======================
@api_bp.route("/marketdata", methods=["GET"])
def marketdata():
    symbol = request.args.get("symbol")
    if not symbol:
        abort(400, description="Query parameter 'symbol' is required (e.g., AAPL, MSFT, BMW.DE).")

    # Default values if not provided
    period = request.args.get("range", "1mo")
    interval = request.args.get("interval", "1d")

    # -------- Caching-Logik --------
    cache_key = (symbol, period, interval)
    now = _now_utc()
    cache_entry = MARKETDATA_CACHE.get(cache_key)

    # TTL z.B. 5 Minuten
    ttl_seconds = 300

    if cache_entry and cache_entry["expires_at"] > now:
        # Direkt aus Cache antworten
        return jsonify(cache_entry["payload"]), 200

    # -------- Wenn nicht im Cache oder abgelaufen: frische Daten holen --------
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period, interval=interval)
    except Exception as e:
        abort(500, description=f"Error fetching market data: {str(e)}")

    if hist.empty:
        abort(404, description=f"No market data found for symbol '{symbol}'.")

    data = []
    for ts, row in hist.iterrows():
        data.append({
            "datetime": ts.isoformat(),
            "open": float(row["Open"]),
            "high": float(row["High"]),
            "low": float(row["Low"]),
            "close": float(row["Close"]),
            "volume": int(row["Volume"]) if not (row["Volume"] != row["Volume"]) else None,  # handle NaN
        })

    payload = {
        "symbol": symbol,
        "range": period,
        "interval": interval,
        "data": data,
    }

    # In Cache speichern
    MARKETDATA_CACHE[cache_key] = {
        "expires_at": now + timedelta(seconds=ttl_seconds),
        "payload": payload,
    }

    return jsonify(payload), 200

# ======================
#      Company-Info
# ======================

@api_bp.route("/companyinfo", methods=["GET"])
def companyinfo():
    symbol = request.args.get("symbol")
    if not symbol:
        abort(400, description="Query parameter 'symbol' is required (e.g., AAPL, MSFT, BMW.DE).")

    try:
        ticker = yf.Ticker(symbol)

        info = {}

        if hasattr(ticker, "info") and isinstance(ticker.info, dict):
            info = ticker.info or {}
        else:
            basic = getattr(ticker, "basic_info", {}) or {}
            fast = getattr(ticker, "fast_info", {}) or {}

            info = {**basic, **fast}

        if not info:
            abort(404, description=f"No company data found for symbol '{symbol}'.")

    except Exception as e:
        abort(500, description=f"Error fetching company information: {str(e)}")

    return jsonify({
        "symbol": symbol,
        "company_data": info
    }), 200

@api_bp.route("/aktie/search", methods=["GET"])
def aktie_search():
    """
    Suche nach Aktien über Namen/Firma/Symbol mit yfinance.
    - 1x yf.Search(...) für die eigentliche Suche
    - danach pro gefundenem Symbol ein yf.Ticker(symbol).info Call, um ISIN zu holen
    Antwort: nur Aktien-Daten (quotes), angereichert um 'ticker' und 'isin'.
    """
    # Name aus Query-Param holen: ?name=Apple oder ?q=Apple
    query = request.args.get("name") or request.args.get("q")
    if not query:
        abort(400, description="Query parameter 'name' (oder 'q') ist erforderlich, z.B. ?name=Apple")

    try:
        # 1. API-Call: Suche nach passenden Symbolen
        search = yf.Search(query, max_results=10)
        quotes = search.quotes or []
    except Exception as e:
        abort(500, description=f"Fehler bei der Aktie-Suche: {str(e)}")

    if not quotes:
        abort(404, description=f"Keine Aktien-Treffer für '{query}' gefunden.")

    # 2. Für jedes gefundene Symbol ISIN nachladen
    #    (zusätzlicher API-Call pro Symbol)
    for q in quotes:
        symbol = q.get("symbol")
        isin = None

        if symbol:
            try:
                ticker_obj = yf.Ticker(symbol)
                info = getattr(ticker_obj, "info", {}) or {}
                # je nach Datenquelle kann der Key 'isin' oder 'ISIN' heißen oder gar nicht existieren
                isin = info.get("isin") or info.get("ISIN")
            except Exception:
                isin = None  # Wenn etwas schiefgeht, ISIN einfach leer lassen

        # ticker-Feld explizit setzen (alias für symbol)
        q["ticker"] = symbol
        # ISIN-Feld ergänzen
        q["isin"] = isin

    # Nur Aktien-Daten zurückgeben
    return jsonify({
        "query": query,
        "quotes": quotes
    }), 200

@api_bp.route("/aktie/trending", methods=["GET"])
def aktie_trending():
    """
    Liefert Trending-Aktien von Yahoo Finance.
    - Holt Trending-List direkt vom Yahoo-Endpoint (über requests)
    - Anreichern der Ticker mit Details über yfinance.Ticker(...).info
    - Gibt je Aktie u.a. Ticker, ISIN, Namen, Exchange, Sector, Industry, Preis zurück.
    """

    # Optionaler Query-Parameter: Region (Standard: US)
    region = request.args.get("region", "US")
    url = f"https://query1.finance.yahoo.com/v1/finance/trending/{region}"

    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    # 1) Trending-Daten von Yahoo holen
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        abort(500, description=f"Fehler beim Abrufen der Trending-Aktien: {str(e)}")

    # 2) Quotes aus der Antwort extrahieren
    try:
        results = data.get("finance", {}).get("result", [])
        if not results:
            abort(404, description=f"Keine Trending-Daten für Region '{region}' gefunden.")

        quotes = results[0].get("quotes", [])
    except Exception:
        abort(500, description="Antwortformat von Yahoo Finance unerwartet.")

    if not quotes:
        abort(404, description=f"Keine Trending-Aktien für Region '{region}' gefunden.")

    # 3) Für jeden Ticker Details + ISIN via yfinance holen
    enriched = []
    for q in quotes:
        symbol = q.get("symbol")
        info = {}
        if symbol:
            try:
                ticker_obj = yf.Ticker(symbol)
                info = getattr(ticker_obj, "info", {}) or {}
            except Exception:
                info = {}

        enriched.append({
            # Basis
            "symbol": symbol,
            "ticker": symbol,

            # Namen
            "shortname": (
                info.get("shortName")
                or q.get("shortName")
                or q.get("shortname")
            ),
            "longname": (
                info.get("longName")
                or q.get("longName")
                or q.get("longname")
            ),

            # Börse / Markt
            "exchange": (
                info.get("exchange")
                or q.get("fullExchangeName")
                or q.get("exchange")
            ),

            # Finanzdaten
            "currency": info.get("currency"),
            "sector": info.get("sector"),
            "industry": info.get("industry"),
            "quoteType": info.get("quoteType") or q.get("quoteType"),
            "regularMarketPrice": info.get("regularMarketPrice"),
            "regularMarketChangePercent": info.get("regularMarketChangePercent"),

            # ISIN (falls verfügbar)
            "isin": info.get("isin") or info.get("ISIN"),

            # optional: der rohe Trending-Eintrag von Yahoo
            "raw_trending": q,
        })

    return jsonify({
        "region": region,
        "count": len(enriched),
        "results": enriched,
    }), 200


