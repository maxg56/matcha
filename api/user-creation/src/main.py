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

cur.execute("""
        select count(*) from users
    """)
count = cur.fetchone()[0]
if count > 0:
    print(f"⚠️ Il y a déjà {count} utilisateurs dans la base de données.")
    print("Vide la table avant de créer de nouveaux utilisateurs random.")
    exit(1)

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
    # radius_deg_lon = radius_km / (111 * math.cos(math.radians(center_lat)))

    # Génération uniforme dans le cercle
    r = radius_deg_lat * math.sqrt(random.random())
    theta = random.random() * 2 * math.pi

    lat = center_lat + r * math.cos(theta)
    lon = center_lon + r * math.sin(theta) / math.cos(math.radians(center_lat))

    return round(lat, 6), round(lon, 6)


print("🔄 Création de 500 utilisateurs...")

for _ in range(500):
    gender = random.choice(genders)
    if gender == "woman":
        first_name = fake.first_name_female()
    else:
        first_name = fake.first_name_male()
    last_name = fake.last_name()
    username = fake.unique.user_name()
    email = f"{username}@exemple.com"
    password_hash = bcrypt.hashpw("password123".encode("utf-8"),
                                  bcrypt.gensalt()).decode("utf-8")
    birth_date = fake.date_of_birth(minimum_age=18, maximum_age=60)
    height = random.randint(150, 200)
    alcohol_consumption = random.choice(['yes', 'sometimes', 'no'])
    smoking = random.choice(['yes', 'sometimes', 'no'])
    cannabis = random.choice(['yes', 'sometimes', 'no'])
    drugs = random.choice(['yes', 'sometimes', 'no'])
    pets = random.choice(['yes', 'no'])
    social_activity_level = random.choice(['low', 'medium', 'high', 'other'])
    sport_activity = random.choice(['low', 'medium', 'high', 'other'])
    education_level = random.choice(['high_school', 'bachelor', 'master',
                                     'doctorate', 'other'])
    personal_opinion = fake.text(max_nb_chars=100)
    bio = fake.text(max_nb_chars=200)
    birth_city = fake.city()
    current_city = fake.city()
    job = fake.job()
    religion = random.choice(['christianity', 'islam', 'hinduism', 'buddhism',
                              'atheism', 'other'])
    relationship_type = random.choice(['friendship', 'short_term', 'long_term',
                                       'life', 'other'])
    children_status = random.choice(['yes', 'no', 'other'])
    children_details = fake.text(max_nb_chars=50)
    zodiac_sign = random.choice(['aries', 'taurus', 'gemini', 'cancer', 'leo',
                                 'virgo', 'libra', 'scorpio', 'sagittarius',
                                 'capricorn', 'aquarius', 'pisces'])
    hair_color = random.choice(['black', 'brown', 'blonde', 'red', 'gray',
                                'white', 'other'])
    skin_color = random.choice(['white', 'black', 'brown', 'yellow', 'olive',
                                'other'])
    eye_color = random.choice(['brown', 'blue', 'green', 'hazel', 'gray',
                               'other'])
    fame = random.randint(0,  100)
    sex_pref = random.choice(sex_prefs)
    political_view = random.choice(['left', 'center', 'right', 'apolitical',
                                    'other'])
    latitude, longitude = random_point_in_circle()

    tags = random.sample(range(1, 17), 5)

    cur.execute("""
        INSERT INTO users (
            username, first_name, last_name, email, password_hash, birth_date,
            height, alcohol_consumption, smoking, cannabis, drugs, pets,
            social_activity_level, sport_activity, education_level,
            personal_opinion, bio, birth_city, current_city, job, religion,
            relationship_type, children_status, children_details, zodiac_sign,
            hair_color, skin_color, eye_color, fame, gender, sex_pref,
            political_view, latitude, longitude
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (username) DO NOTHING
        RETURNING id
    """, (
        username, first_name, last_name, email, password_hash, birth_date,
        height, alcohol_consumption, smoking, cannabis, drugs, pets,
        social_activity_level, sport_activity, education_level,
        personal_opinion, bio, birth_city, current_city, job, religion,
        relationship_type, children_status, children_details, zodiac_sign,
        hair_color, skin_color, eye_color, fame, gender, sex_pref,
        political_view, latitude, longitude
    ))
    result = cur.fetchone()
    if result:
        user_id = result[0]
        print(f"✅ Utilisateur créé: {username} (ID: {user_id})")
        for tag_id in tags:
            cur.execute("INSERT INTO user_tags (user_id, tag_id) VALUES(%s, %s)",
                        (user_id, tag_id))

print("✅ fin de la création des utilisateurs")

conn.commit()
cur.close()
conn.close()

print("✅ 500 utilisateurs ajoutés dans un rayon de 40 km autour de Paris")
