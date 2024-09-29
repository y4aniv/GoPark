from flask import Flask, request
from flask_cors import CORS
from utils.sqlalchemy import session
from classes import Parking, Car, Person, Spot, Subscription
from typing import Dict, Any, List, Optional

server = Flask(__name__)
CORS(server)

@server.get("/api/parkings")
def get_parkings() -> Dict[str, Any]:
    """
    Récupère la liste des parkings.

    Sortie :
    - dict : Liste des parkings
    """
    parkings = session.query(Parking).order_by(Parking.name).all()
    return {
        "status": "success",
        "parkings": [
            {
                "available_spots": len(parking.get_available_spots()),
                **parking.to_dict()
            } for parking in parkings
        ]
    }, 200

@server.get("/api/parkings/<parking_id>")
def get_parking(parking_id: str) -> Dict[str, Any]:
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
def get_parking_spots(parking_id: str) -> Dict[str, Any]:
    """
    Récupère la liste des places d'un parking.

    Paramètres :
    - parking_id (str) : Identifiant du parking.
    - level (int) OPTIONNEL : Numéro de l'étage.

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

    if level is not None:
        try:
            level = int(level)
            spots = parking.get_spots_by_level(level)
        except ValueError:
            return {
                "status": "error",
                "message": "INVALID_LEVEL"
            }, 400

    spots.sort(key=lambda spot: spot.tag)
    return {
        "status": "success",
        "spots": [{
            "car": {
                "id": spot.car.id if spot.car else None,
                "license_plate": spot.car.license_plate if spot.car else None
            },
            "id": spot.id,
            "is_taken": spot.is_taken,
            "level": spot.level,
            "parking": spot.parking.id,
            "spot": spot.spot,
            "subscription": spot.subscription.id if spot.subscription else None,
            "tag": spot.tag
        } for spot in spots]
    }, 200

@server.post('/api/parkings/<parking_id>/spots/<spot_id>/park')
def park_car(parking_id: str, spot_id: str) -> Dict[str, Any]:
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

@server.post('/api/parkings/<parking_id>/spots/<spot_id>/unpark')
def unpark_car(parking_id: str, spot_id: str) -> Dict[str, Any]:
    """
    Désactive une place de parking.

    Paramètres :
    - parking_id (str) : Identifiant du parking.
    - spot_id (str) : Identifiant de la place de parking.

    Sortie :
    - dict : Voiture désactivée.
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

    if not spot.is_taken:
        return {
            "status": "error",
            "message": "SPOT_NOT_TAKEN"
        }, 400

    car = spot.car
    car.unpark()

    return {
        "status": "success",
        "car": car.to_dict()
    }, 200

@server.get("/api/parkings/<parking_id>/subscriptions")
def get_parking_subscriptions(parking_id: str) -> Dict[str, Any]:
    """
    Récupère la liste des abonnements d'un parking.

    Paramètres :
    - parking_id (str) : Identifiant du parking.

    Sortie :
    - dict : Liste des abonnements du parking.
    """
    parking = session.get(Parking, parking_id)

    if not parking:
        return {
            "status": "error",
            "message": "PARKING_NOT_FOUND"
        }, 404

    subscriptions = sorted(parking.subscriptions, key=lambda subscription: subscription.spot.tag)
    return {
        "status": "success",
        "subscriptions": [
            {
                "person": {
                    "id": subscription.person.id,
                    "first_name": subscription.person.first_name,
                    "last_name": subscription.person.last_name
                },
                "spot": {
                    "id": subscription.spot.id,
                    "tag": subscription.spot.tag
                },
                "id": subscription.id
            }
            for subscription in subscriptions
        ]
    }, 200

@server.post("/api/parkings/<parking_id>/subscriptions/<subscription_id>/delete")
def delete_subscription(parking_id: str, subscription_id: str) -> Dict[str, Any]:
    """
    Supprime un abonnement.

    Paramètres :
    - parking_id (str) : Identifiant du parking.
    - subscription_id (str) : Identifiant de l'abonnement.

    Sortie :
    - dict : Abonnement supprimé.
    """
    parking = session.get(Parking, parking_id)

    if not parking:
        return {
            "status": "error",
            "message": "PARKING_NOT_FOUND"
        }, 404

    subscription = session.get(Subscription, subscription_id)

    if not subscription:
        return {
            "status": "error",
            "message": "SUBSCRIPTION_NOT_FOUND"
        }, 404

    subscription.delete()

    return {
        "status": "success",
    }, 200

@server.get("/api/parkings/<parking_id>/statistics")
def get_parking_statistics(parking_id: str) -> Dict[str, Any]:
    """
    Récupère les statistiques d'un parking.

    Paramètres :
    - parking_id (str) : Identifiant du parking.

    Sortie :
    - dict : Statistiques du parking.
    """
    parking = session.get(Parking, parking_id)

    if not parking:
        return {
            "status": "error",
            "message": "PARKING_NOT_FOUND"
        }, 404
    
    available_spots = len(parking.get_available_spots())
    taken_spots = len(parking.spots) - available_spots

    reserved_spots = len(parking.get_reserved_spots())
    not_reserved_spots = len(parking.spots) - reserved_spots

    cars = session.query(Car).all()
    car_brands = {}

    for car in cars:
        if car.spot and car.spot.parking.id == parking_id:
            car_brands[car.brand] = car_brands.get(car.brand, 0) + 1

    cars_bad_parked = [car for car in cars if car.is_bad_parked()]

    levels = {}
    for spot in parking.spots:
        levels[spot.level] = levels.get(spot.level, 0) + 1

    return {
        "status": "success",
        "statistics": {
            "total_spots": len(parking.spots),
            "total_levels": len(levels),
            "total_cars": len([car for car in cars if car.spot and car.spot.parking.id == parking_id]),
            "total_subscriptions": len(parking.subscriptions),
            "available_spots": available_spots,
            "taken_spots": taken_spots,
            "reserved_spots": reserved_spots,
            "not_reserved_spots": not_reserved_spots,
            "car_brands": car_brands,
            "cars_bad_parked": [{
                "id": car.id,
                "brand": car.brand,
                "color": car.color,
                "license_plate": car.license_plate,
                "owner": {
                    "id": car.owner.id,
                    "first_name": car.owner.first_name,
                    "last_name": car.owner.last_name
                },
                "spot": {
                    "id": car.spot.id,
                    "tag": car.spot.tag,
                    "owner": {
                        "id": car.spot.subscription.person.id,
                        "first_name": car.spot.subscription.person.first_name,
                        "last_name": car.spot.subscription.person.last_name
                    }
                }
            }
            for car in cars_bad_parked],

            "levels": levels
        }
    }, 200

@server.get("/api/cars")
def get_cars() -> Dict[str, Any]:
    """
    Récupère la liste des voitures.

    Sortie :
    - dict : Liste des voitures
    """
    cars = session.query(Car).order_by(Car.license_plate).all()
    return {
        "status": "success",
        "cars": [car.to_dict() for car in cars]
    }, 200

@server.get("/api/cars/<car_id>")
def get_car(car_id: str) -> Dict[str, Any]:
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
def get_persons() -> Dict[str, Any]:
    """
    Récupère la liste des personnes.

    Sortie :
    - dict : Liste des personnes
    """
    persons = session.query(Person).order_by(Person.first_name).all()
    return {
        "status": "success",
        "persons": [person.to_dict() for person in persons]
    }, 200

if __name__ == "__main__":
    server.run(debug=True, port=8000)
