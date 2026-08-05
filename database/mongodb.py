import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE")

if not MONGODB_URL or not MONGODB_DATABASE:
    raise RuntimeError("MongoDB environment variables are not set")

client = MongoClient(MONGODB_URL)

mongo_db = client[MONGODB_DATABASE]


def test_mongodb_connection():
    try:
        client.admin.command("ping")

        print("MongoDB connected successfully!")

        post = mongo_db.content_metadata.find_one(
            {"title": "Test Social Post"}
        )

        if post:
            print("Test document found:")
            print(post["title"])
        else:
            print("Test document not found.")

    except Exception as error:
        print("MongoDB connection failed:")
        print(error)


if __name__ == "__main__":
    test_mongodb_connection()