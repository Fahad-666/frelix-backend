import os
from flask import Flask
from flask_cors import CORS
from config.database import Base, engine
from controllers.user_controller import register_user, login_user

Base.metadata.create_all(bind=engine)

app = Flask(__name__)
CORS(app)

@app.route("/register", methods=["POST"])
def register():
    return register_user()

@app.route("/login", methods=["POST"])
def login():
    return login_user()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
