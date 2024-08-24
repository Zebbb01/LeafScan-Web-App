from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4
import re

db = SQLAlchemy()

def get_uuid():
    return uuid4().hex

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, index=True)
    password = db.Column(db.Text, nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    verification_code = db.Column(db.String(32), nullable=True)

    @staticmethod
    def is_valid_email(email):
        """Validate email format."""
        return re.match(r"[^@]+@[^@]+\.[^@]+", email) is not None

    @staticmethod
    def hash_password(password):
        """Hash password before storing."""
        from werkzeug.security import generate_password_hash
        return generate_password_hash(password)


# Example usage
# user = User(name="John Doe", email="john@example.com", password=User.hash_password("password123"))
# if User.is_valid_email(user.email):
#     db.session.add(user)
#     db.session.commit()
