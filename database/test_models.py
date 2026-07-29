from database import SessionLocal
from models import User, Role, UserRole

db = SessionLocal()

try:
    users = db.query(User).all()

    print("Users from PostgreSQL:")

    for user in users:
        print(user.id, user.name, user.email)

finally:
    db.close()