from datetime import date

from flask import Blueprint, request, jsonify, abort

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
