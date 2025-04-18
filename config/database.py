from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import pymysql

DB_USERNAME = "root"
DB_PASSWORD = "Fahad@2008"
DB_HOST = "127.0.0.1"
DB_PORT = 3306
DB_NAME = "frelix"

def get_connection():
    return pymysql.connect(
        user=DB_USERNAME,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        autocommit=True
    )

engine = create_engine("mysql+pymysql://", creator=get_connection)

SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()
