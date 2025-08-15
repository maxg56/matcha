import os
import random
import psycopg2
import bcrypt
import math
from faker import Faker
from dotenv import load_dotenv

import os
import random
import psycopg2
import bcrypt
import math
from faker import Faker
from dotenv import load_dotenv

# Charger les variables depuis le .env
load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", 5432)
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")

# Connexion PostgreSQL
conn = psycopg2.connect(
    host=DB_HOST,
    port=DB_PORT,
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASS
)
cur = conn.cursor()

# Faker pour générer des données réalistes
fake = Faker("fr_FR")
genders = ["woman", "man"]
sex_prefs = ["woman", "man", "both"]

# Centre de Paris (Notre-Dame)
center_lat = 48.8566
center_lon = 2.3522
radius_km = 40  # rayon 40 km

def random_point_in_circle():
    """Génère un point aléatoire dans un cercle autour de Paris."""
    # Conversion km -> degrés latitude
    radius_deg_lat = radius_km / 111  # approx.
    radius_deg_lon = radius_km / (111 * math.cos(math.radians(center_lat)))

    # Génération uniforme dans le cercle
    r = radius_deg_lat * math.sqrt(random.random())
    theta = random.random() * 2 * math.pi

    lat = center_lat + r * math.cos(theta)
    lon = center_lon + r * math.sin(theta) / math.cos(math.radians(center_lat))

    return round(lat, 6), round(lon, 6)

for _ in range(500):
    gender = random.choice(genders)
    first_name = fake.first_name_female() if gender == "woman" else fake.first_name_male()
    last_name = fake.last_name()
    username = fake.unique.user_name()
    email = f"{username}@exemple.com"
    password_hash = bcrypt.hashpw("password123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    fame = random.randint(0, 100)
    sex_pref = random.choice(sex_prefs)
    bio = fake.text(max_nb_chars=200)
    latitude, longitude = random_point_in_circle()

    # Générer 5 valeurs différentes entre 1 et 16
    tags = random.sample(range(1, 17), 5)

    cur.execute("""
        INSERT INTO users (
            username, first_name, last_name, email, password_hash, fame,
            gender, sex_pref, bio, latitude, longitude
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (username, email) DO NOTHING
        RETURNING id
    """, (
        username, first_name, last_name, email, password_hash, fame,
        gender, sex_pref, bio, latitude, longitude
    ))
    id = cur.fetchone()[0]
    if id:
        user_id = result[0]
        for tag_id in tags:
            cur.execute("INSERT INTO user_tags (user_id, tag_id) VALUES (%s, %s)", (user_id, tag_id))


conn.commit()
cur.close()
conn.close()

print("✅ 500 utilisateurs ajoutés dans un rayon de 40 km autour de Paris")
