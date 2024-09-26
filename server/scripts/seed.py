import os
from utils.sqlalchemy import Base, engine
from classes import Parking, Person, Car
from utils.sqlalchemy import session
from random import randint, choice


SCRIPT_DIR = os.path.dirname(__file__)

def reset_database():
    """
    Supprime et recrée toutes les tables de la base de données.
    """
    
    print("[?] Dropping tables")
    Base.metadata.drop_all(engine)
    print("[+] Tables dropped\n")
    
    print("[?] Creating tables")
    Base.metadata.create_all(engine)
    print("[+] Tables created\n")

def create_parkings():
    """
    Seed la base de données avec des parkings.
    """

    print("[?] Creating parkings")
    Parking(
        name="Parking République",
        address="12 Avenue de la République",
        zip_code="75011",
        city="Paris",
        levels=3,
        spots_per_level=50
    ).save(session)

    Parking(
        name="Parking Centre Commercial Atlantis",
        address="Rue de la Durantière",
        zip_code="44800",
        city="Saint-Herblain",
        levels=5,
        spots_per_level=100
    ).save(session)

    Parking(
        name="Parking Aéroport Charles de Gaulle P1",
        address="Route des Badauds",
        zip_code="95700",
        city="Roissy-en-France",
        levels=8,
        spots_per_level=200
    ).save(session)
    print("[+] Parkings created \n")

def create_persons():
    """
    Seed la base de données avec des personnes.
    """

    print("[?] Creating persons")
    first_names_path = os.path.join(SCRIPT_DIR, 'datasets', 'persons','first_names.txt')
    last_names_path = os.path.join(SCRIPT_DIR, 'datasets', 'persons','last_names.txt')

    first_names = open(first_names_path, "r").read().split("\n")
    last_names = open(last_names_path, "r").read().split("\n")

    for i in range(600):
        Person(
            first_name=first_names[i % randint(1, len(first_names))],
            last_name=last_names[i % randint(1, len(last_names))],
            birth_date=f"{randint(1950, 2000)}-{randint(1, 12):02d}-{randint(1, 28):02d}"
        ).save(session)

    print("[+] Persons created\n")

def create_cars():
    """
    Seed la base de données avec des voitures.
    """

    print("[?] Creating cars")
    brands_path = os.path.join(SCRIPT_DIR, 'datasets', 'cars','brands.txt')
    models_path = os.path.join(SCRIPT_DIR, 'datasets', 'cars','models.txt')
    colors_path = os.path.join(SCRIPT_DIR, 'datasets', 'cars','colors.txt')
    
    brands = open(brands_path, "r").read().split("\n")
    models = open(models_path, "r").read().split("\n")
    colors = open(colors_path, "r").read().split("\n")

    for person in session.query(Person).all():
        has_two_cars = randint(0, 1)
        for i in range(2 if has_two_cars else 1):
            Car(
                license_plate=f"{chr(randint(65, 90))}{chr(randint(65, 90))}{randint(100, 999)}{chr(randint(65, 90))}{chr(randint(65, 90))}",
                brand=choice(brands),
                model=choice(models),
                color=choice(colors),
                owner=person
            ).save(session)
    
    print("[+] Cars created\n")
    
def park_cars():
    """
    Seed la base de données avec des voitures garées.
    """
    
    print("[?] Parking cars")
    parkings = session.query(Parking).all()
    cars = session.query(Car).all()

    for i in range(450):
        car = cars[i]
        spot = choice(parkings).get_available_spot()

        if not spot:
            continue
        
        car.park(spot)

    print("[+] Cars parked\n")

if __name__ == "__main__":
    reset_database()
    create_parkings()
    create_persons()
    create_cars()
    park_cars()