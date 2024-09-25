from flask import Flask
from flask_cors import CORS
from utils.sqlalchemy import session
from classes import Parking, Car, Person

server = Flask(__name__)
CORS(server)

@server.get("/api/parkings")
def get_parkings():
    """
    Récupère la liste des parkings.

    Sortie :
    - dict : Liste des parkings
    """
    
    return {"parkings": [
        parking.to_dict() for parking in session.query(Parking).all()
    ]}, 200

@server.get("/api/cars")
def get_cars():
    """
    Récupère la liste des voitures.

    Sortie :
    - dict : Liste des voitures
    """
    
    return {"cars": [
        car.to_dict() for car in session.query(Car).all()
    ]}, 200

@server.get("/api/persons")
def get_persons():
    """
    Récupère la liste des personnes.

    Sortie :
    - dict : Liste des personnes
    """
    
    return {"persons": [
        person.to_dict() for person in session.query(Person).all()
    ]}, 200

if __name__ == "__main__":
    server.run(debug=True, port=8000)