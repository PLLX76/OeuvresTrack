from flask import jsonify, request, session, redirect, render_template, make_response
import uuid, string, re

from api import db, get_new_users_id, check_password, encrypt_password

from datetime import datetime
from bson.timestamp import Timestamp

characters = string.ascii_letters + string.digits

client_key = "6LeJTqwoAAAAAJJURTVkEOnfuxq47UPBIS3bDGn_"


def validate_email(email):
    if re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return True
    return False


class User:
    def start_session(self, user):
        del user["password"]
        del user["date"]
        del user["subscriptions_data"]
        session["logged_in"] = True
        session["user"] = user

        return redirect("/app?login=success", code=302)

    def signup(self):
        if (
            request.form.get("password") == ""
            or request.form.get("password-confirm") == ""
        ):
            return (
                render_template(
                    "index.html",
                    error="Veuillez entrer un mot de passe.",
                ),
                401,
            )
        if request.form.get("username") == "" or request.form.get("email") == "":
            return (
                render_template(
                    "index.html",
                    error="Veuillez entrer un nom d'utilisateur et un email.",
                ),
                401,
            )
        if request.form.get("password") != request.form.get("password-confirm"):
            return (
                render_template(
                    "index.html",
                    error="Les mots de passe ne correspondent pas.",
                    username=request.form.get("username"),
                    email=request.form.get("email"),
                ),
                401,
            )

        if (
            len(request.form.get("username")) > 30
            or len(request.form.get("email")) > 64
        ):
            return (
                render_template(
                    "index.html",
                    error="Le nom d'utilisateur (30 caractères maximum) ou l'email (64 caractères maximum) est trop long.",
                ),
                401,
            )
        if (
            len(request.form.get("password")) < 6
            or len(request.form.get("password")) > 64
        ):
            return (
                render_template(
                    "index.html",
                    error="Le mot de passe est trop court (6 caractères minimums) ou trop long (64 caractères maximum).",
                    username=request.form.get("username"),
                    email=request.form.get("email"),
                ),
                401,
            )
        if validate_email(request.form.get("email")) == False:
            return (
                render_template(
                    "index.html",
                    error="L'email n'est pas valide.",
                    username=request.form.get("username"),
                ),
                401,
            )
        user = {
            "_id": uuid.uuid4().hex,
            "id": get_new_users_id(),
            "name": request.form.get("username").strip(),
            "email": request.form.get("email").strip(),
            "password": request.form.get("password"),
            "date": Timestamp(int(datetime.now().timestamp()), 1),
        }

        user["password"] = encrypt_password(user["password"])

        erreur = ""

        if db.get_collection("users").find_one({"email": user["email"]}):
            erreur += "L'email est déjà utilisé. "

        if db.get_collection("users").find_one(
            {"name": re.compile(f'^{user["name"].lower().strip()}$', re.IGNORECASE)}
        ):
            erreur += "Le nom d'utilisateur est déjà utilisé. "

        if erreur != "":
            return (
                render_template(
                    "index.html",
                    error=erreur,
                ),
                401,
            )

        if db.get_collection("users").insert_one(user):
            db.get_collection("ulist").insert_one({"id": user["id"], "list": []})
            db.settings.insert_one(
                {
                    "user_id": user["id"],
                    "adult-result": False,
                    "ignore-overs": True,
                    "lexicon": {},
                }
            )
            return self.start_session(user)
        else:
            erreur += "Une erreur est survenue. Veuillez réessayer."

        return (
            render_template(
                "index.html",
                error=erreur,
                username=request.form.get("username"),
                email=request.form.get("email"),
            ),
            401,
        )

    def signout(self):
        session.clear()
        return redirect("/")

    def login(self):
        erreur = ""
        if request.form.get("username") == "" or request.form.get("password") == "":
            return (
                render_template(
                    "index.html",
                    error="Veuillez entrer un nom d'utilisateur et un mot de passe",
                ),
                401,
            )

        if validate_email(request.form.get("username")):
            user = db.get_collection("users").find_one(
                {"email": request.form.get("username").strip()}
            )
        else:
            user = db.get_collection("users").find_one(
                {
                    "name": re.compile(
                        f'^{request.form.get("username").lower().strip()}$',
                        re.IGNORECASE,
                    )
                }
            )

        if user and check_password(request.form.get("password"), user["password"]):
            return self.start_session(user)
        else:
            erreur = "Le nom d'utilisateur ou/et le mot de passe est incorrect"

        return (
            render_template(
                "index.html",
                error=erreur,
                username=request.form.get("username"),
            ),
            401,
        )
