from flask import request, jsonify
from config.database import SessionLocal
from models.user import User
from utils.hash import hash_password
from utils.verify_password import verify_password
from datetime import datetime

def register_user():
    data = request.get_json()
    db = SessionLocal()
    
    existing_user = db.query(User).filter(User.email == data["email"]).first()
    if existing_user:
        return jsonify({"error": "User already registered"}), 400

    try:
        new_user = User(
            name=data["name"],
            email=data["email"],
            password=hash_password(data["password"]),
            created_at=int(datetime.now().timestamp())
        )
        db.add(new_user)
        db.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()

def login_user():
    data = request.get_json()
    db = SessionLocal()
    user = db.query(User).filter(User.email == data["email"]).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    if not verify_password(data["password"], user.password):
        return jsonify({"error": "Invalid password"}), 401
    return jsonify({"message": "User logged in successfully"}), 200