from flask import Flask, jsonify, request, session
from flask_mail import Mail, Message
from flask_bcrypt import Bcrypt
from models import db, User
import os
import random
import string
import re

def init_user_routes(app):
    bcrypt = Bcrypt(app)
    mail = Mail(app)

    # Generate a random verification code
    def generate_verification_code():
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))

    # Send verification email
    def send_verification_email(email, code):
        msg = Message('Verification Code', 
                      sender=os.getenv('MAIL_USERNAME'),
                      recipients=[email])
        msg.html = f'''
        <html>
        <body>
            <p>Your verification code is:</p>
            <p style="margin-top: 20px; font-size: 24px; font-weight: bold;">{code}</p>
        </body>
        </html>
        '''
        mail.send(msg)

    # Forgot Password
    @app.route("/forgot_password", methods=["POST"])
    def forgot_password():
        email = request.json.get("email")
        
        if not User.is_valid_email(email):
            return jsonify({"error": "Invalid email address"}), 400
        
        user = User.query.filter_by(email=email).first()
        if user is None:
            return jsonify({"error": "Email not found"}), 404

        def generate_password():
            while True:
                password = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
                if re.search(r'\d', password) and len(password) >= 8:
                    return password

        new_password = generate_password()
        hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        
        user.password = hashed_password
        db.session.commit()

        msg = Message('Your New Password', 
                      sender=os.getenv('MAIL_USERNAME'), 
                      recipients=[email])
        msg.body = f'Your new password is: {new_password}'
        mail.send(msg)

        return jsonify({"message": "New password sent to your email"}), 200

    # SignUp
    @app.route("/create_token", methods=["POST"])
    def create_token():
        name = request.json["name"]
        email = request.json["email"]
        password = request.json["password"]
        
        user = User.query.filter_by(email=email).first()

        if user and user.is_verified:
            return jsonify({"error": "Email already exists"}), 409
        elif user and not user.is_verified:
            # Resend verification code
            verification_code = generate_verification_code()
            user.verification_code = verification_code
            user.password = bcrypt.generate_password_hash(password).decode('utf-8')
            db.session.commit()
            send_verification_email(email, verification_code)
            return jsonify({"message": "Verification email resent. Please check your email."}), 200
        
        # Create new user if not exists
        verification_code = generate_verification_code()
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(name=name, email=email, password=hashed_password, is_verified=False, verification_code=verification_code)
        db.session.add(new_user)
        db.session.commit()

        send_verification_email(email, verification_code)
        
        return jsonify({
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        })
    
    # Verify account
    @app.route("/verify_account", methods=["POST"])
    def verify_account():
        email = request.json["email"]
        code = request.json["code"]
    
        user = User.query.filter_by(email=email).first()
    
        if user is None or user.verification_code != code:
            return jsonify({"error": "Invalid verification code"}), 400
        
        user.is_verified = True
        db.session.commit()
    
        session['user_id'] = user.id
    
        return jsonify({"status": "verified"})
    
    # SignUp Website
    @app.route("/create_token1", methods=["POST"])
    def create_token1():
        name = request.json["name"]
        email = request.json["email"]
        password = request.json["password"]
        
        user_exists = User.query.filter_by(email=email).first() is not None
    
        if user_exists:
            return jsonify({"error": "Email already exists"}), 409
        
        verification_code = generate_verification_code()
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(name=name, email=email, password=hashed_password, is_verified=True, verification_code=verification_code)
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        })
    
    # Login
    @app.route("/token", methods=["POST"])
    def token():
        email = request.json["email"]
        password = request.json["password"]
    
        user = User.query.filter_by(email=email).first()
    
        if user is None:
            return jsonify({"error": "Email not exist"}), 401
        
        if not bcrypt.check_password_hash(user.password, password):
            return jsonify({"error": "Wrong password"}), 401
        
        if not user.is_verified:
            return jsonify({"error": "Account not verified"}), 403
    
        session["user_id"] = user.id
    
        return jsonify({
            "status": "success",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }
        })
    
    @app.route("/user/<id>", methods=["GET"])
    def get_user(id):
        user = User.query.get(id)
        if user is None:
            return jsonify({"error": "User not found"}), 404
    
        return jsonify({
            "id": user.id,
            "name": user.name,
            "email": user.email
        })
    
    @app.route("/check-password", methods=["POST"])
    def check_password():
        id = request.json["id"]
        password = request.json["password"]
    
        user = User.query.get(id)
        if user is None:
            return jsonify({"error": "User not found"}), 404
    
        if bcrypt.check_password_hash(user.password, password):
            return jsonify({"valid": True}), 200
        else:
            return jsonify({"valid": False}), 200
    
    @app.route("/update/<id>", methods=["PUT"])
    def update_profile(id):
        data = request.json
    
        user = User.query.get(id)
        if user is None:
            return jsonify({"error": "User not found"}), 404
    
        if 'name' in data:
            user.name = data['name']
    
        if 'password' in data:
            new_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
            user.password = new_password
    
        try:
            db.session.commit()
            return jsonify({"updated": True}), 200
        except Exception as e:
            print(e)
            db.session.rollback()
            return jsonify({"error": "Could not update profile"}), 500