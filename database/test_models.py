from database import SessionLocal
from models import User, ScheduledPost, PublishingLog

db = SessionLocal()

try:
    # Test Users
    users = db.query(User).all()

    print("\n===== Users =====")
    for user in users:
        print(user.id, user.name, user.email)

    # Test Scheduled Posts
    scheduled_posts = db.query(ScheduledPost).all()

    print("\n===== Scheduled Posts =====")
    if scheduled_posts:
        for post in scheduled_posts:
            print(
                post.id,
                post.title,
                post.status,
                post.scheduled_time
            )
    else:
        print("No scheduled posts found.")

    # Test Publishing Logs
    publishing_logs = db.query(PublishingLog).all()

    print("\n===== Publishing Logs =====")
    if publishing_logs:
        for log in publishing_logs:
            print(
                log.id,
                log.status,
                log.published_at
            )
    else:
        print("No publishing logs found.")

finally:
    db.close()