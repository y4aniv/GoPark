from flask import Flask, request
from flask_cors import CORS
from utils.sqlalchemy import session
from classes import Parking, Car, Person, Spot

server = Flask(__name__)
CORS(server)

@server.get("/api/parkings")
def get_parkings():
    """
    Récupère la liste des parkings.

    Sortie :
    - dict : Liste des parkings
    """
    
    parkings = session.query(Parking).order_by(Parking.name).all()
    return {
        "status": "success",
        "parkings": [
            parking.to_dict() for parking in parkings
        ]
    }, 200

@server.get("/api/parkings/<parking_id>")
def get_parking(parking_id):
    """
    Récupère un parking.

    Paramètres :
    - parking_id (str) : Identifiant du parking.

    Sortie :
    - dict : Parking
    """
    parking = session.get(Parking, parking_id)

    if not parking:
        return {
            "status": "error",
            "message": "PARKING_NOT_FOUND"
        }, 404

    return {
        "status": "success",
        "parking": parking.to_dict()
    }, 200

@server.get("/api/parkings/<parking_id>/spots")
def get_parking_spots(parking_id):
    """
    Récupère la liste des places d'un parking.

    Paramètres :
    - parking_id (str) : Identifiant du parking.
    - level (int) OPTIONEL : Numéro de l'étage.

    Sortie :
    - dict : Liste des places du parking.
    """
    parking = session.get(Parking, parking_id)

    if not parking:
        return {
            "status": "error",
            "message": "PARKING_NOT_FOUND"
        }, 404
    
    level = request.args.get("level")
    spots = parking.spots

    if level:
        try:
            level = int(level)
            spots = parking.get_spots_by_level(level)
        except ValueError:
            return {
                "status": "error",
                "message": "INVALID_LEVEL"
            }, 400

    spots = sorted(spots, key=lambda spot: spot.tag)
    return {
        "status": "success",
        "spots": [spot.to_dict() for spot in spots]
    }, 200

@server.get("/api/parkings/<parking_id>/spots/available")
def get_available_spot(parking_id):
    """
    Récupère une place de parking disponible.

    Paramètres :
    - parking_id (str) : Identifiant du parking.

    Sortie :
    - dict : Place de parking disponible.
    """
    parking = session.get(Parking, parking_id)

    if not parking:
        return {
            "status": "error",
            "message": "PARKING_NOT_FOUND"
        }, 404

    spots = parking.get_available_spots()
    return {
        "status": "success",
        "spots": [spot.to_dict() for spot in spots]
    }, 200

@server.post('/api/parkings/<parking_id>/spots/<spot_id>/park')
def park_car(parking_id, spot_id):
    """
    Gare une voiture dans une place de parking.

    Paramètres :
    - parking_id (str) : Identifiant du parking.
    - spot_id (str) : Identifiant de la place de parking.

    Entrée :
    - dict : Informations de la voiture à garer.

    Sortie :
    - dict : Voiture garée.
    """
    parking = session.get(Parking, parking_id)

    if not parking:
        return {
            "status": "error",
            "message": "PARKING_NOT_FOUND"
        }, 404

    spot = session.get(Spot, spot_id)

    if not spot:
        return {
            "status": "error",
            "message": "SPOT_NOT_FOUND"
        }, 404

    data = request.json

    if not data:
        return {
            "status": "error",
            "message": "NO_DATA"
        }, 400

    print(data)
    car = session.query(Car).filter_by(license_plate=data.get("license_plate")).first()

    if not car:
        return {
            "status": "error",
            "message": "CAR_NOT_FOUND"
        }, 404

    if car.spot:
        return {
            "status": "error",
            "message": "CAR_ALREADY_PARKED"
        }, 400
    
    if spot.is_taken:
        return {
            "status": "error",
            "message": "SPOT_ALREADY_TAKEN"
        }, 400
    
    car.park(spot)

    return {
        "status": "success",
        "car": car.to_dict()
    }, 200

@server.get("/api/cars")
def get_cars():
    """
    Récupère la liste des voitures.

    Sortie :
    - dict : Liste des voitures
    """
    
    cars = session.query(Car).order_by(Car.license_plate).all()
    return {
        "status": "success",
        "cars": [
            car.to_dict() for car in cars
        ]
    }, 200

@server.get("/api/cars/<car_id>")
def get_car(car_id):
    """
    Récupère une voiture.

    Paramètres :
    - car_id (str) : Identifiant de la voiture.

    Sortie :
    - dict : Voiture
    """
    car = session.get(Car, car_id)

    if not car:
        return {
            "status": "error",
            "message": "CAR_NOT_FOUND"
        }, 404

    return {
        "status": "success",
        "car": car.to_dict()
    }, 200

@server.get("/api/persons")
def get_persons():
    """
    Récupère la liste des personnes.

    Sortie :
    - dict : Liste des personnes
    """
    
    persons = session.query(Person).order_by(Person.first_name).all()
    return {
        "status": "success",
        "persons": [
            person.to_dict() for person in persons
        ]
    }, 200

if __name__ == "__main__":
    server.run(debug=True, port=8000)