from flask import Flask, request
from flask_cors import CORS
from utils.sqlalchemy import Session as session
from classes import Parking, Car, Person, Spot, Subscription
from typing import Dict, Any
import re

server = Flask(__name__)
CORS(server)

@server.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

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

@server.post("/api/parkings/create")
def create_parking() -> Dict[str, Any]:
    """
    Crée un parking.

    Entrée :
    - dict : Informations du parking.

    Sortie :
    - dict : Parking créé.
    """
    data = request.json

    if not data:
        return {
            "status": "error",
            "message": "NO_DATA"
        }, 400

    name = data.get("name")
    address = data.get("address")
    zip_code = data.get("zipCode")
    city = data.get("city")
    levels = data.get("levels")
    spots_per_level = data.get("spotsPerLevel")

    if not name or len(name) < 3:
        return {
            "status": "error",
            "message": "INVALID_NAME"
        }, 400
    
    if not address:
        return {
            "status": "error",
            "message": "INVALID_ADDRESS"
        }, 400
    
    if not zip_code or len(zip_code) != 5 or not zip_code.isdigit():
        return {
            "status": "error",
            "message": "INVALID_ZIP_CODE"
        }, 400
    
    if not city:
        return {
            "status": "error",
            "message": "INVALID_CITY"
        }, 400
    
    if not levels or levels < 1 or levels % 1 != 0:
        return {
            "status": "error",
            "message": "INVALID_LEVELS"
        }, 400
    
    if not spots_per_level or spots_per_level < 1 or spots_per_level % 1 != 0:
        return {
            "status": "error",
            "message": "INVALID_SPOTS_PER_LEVEL"
        }, 400
    
    if session.query(Parking).filter_by(name=name).first():
        return {
            "status": "error",
            "message": "PARKING_ALREADY_EXISTS"
        }, 400
    
    parking = Parking(
        name=name, 
        address=address, 
        zip_code=zip_code, 
        city=city, 
        levels=levels,
        spots_per_level=spots_per_level
    )
    parking.save(session)

    return {
        "status": "success",
        "parking": parking.to_dict()
    }, 201

@server.delete("/api/parkings/<parking_id>")
def delete_parking(parking_id: str) -> Dict[str, Any]:
    """
    Supprime un parking.

    Paramètres :
    - parking_id (str) : Identifiant du parking.

    Sortie :
    - dict : Parking supprimé.
    """
    parking = session.get(Parking, parking_id)

    for spot in parking.spots:
        if spot.car:
            spot.car.unpark()
        if spot.subscription:
            spot.subscription.spot = None
        spot.delete()

    for subscription in parking.subscriptions:
        subscription.person.subscriptions.remove(subscription)
        subscription.delete()

    for car in session.query(Car).all():
        if car.spot and car.spot.parking.id == parking_id:
            car.unpark()

    for person in session.query(Person).all():
        for subscription in person.subscriptions:
            if subscription.spot.parking.id == parking_id:
                person.subscriptions.remove(subscription)
                subscription.delete()

    parking.delete()

    return {
        "status": "success",
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

@server.get("/api/parkings/<parking_id>/spots/available")
def get_available_spots(parking_id: str) -> Dict[str, Any]:
    """
    Récupère la liste des places de parking libres.

    Paramètres :
    - parking_id (str) : Identifiant du parking.

    Sortie :
    - dict : Liste des places de parking libres.
    """
    parking = session.get(Parking, parking_id)

    if not parking:
        return {
            "status": "error",
            "message": "PARKING_NOT_FOUND"
        }, 404

    spots = parking.get_available_spots()
    spots.sort(key=lambda spot: spot.tag)
    return {
        "status": "success",
        "spots": [{
            "id": spot.id,
            "level": spot.level,
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

@server.post("/api/parkings/<parking_id>/subscriptions/create")
def create_subscription(parking_id: str) -> Dict[str, Any]:
    """
    Crée un abonnement.

    Paramètres :
    - parking_id (str) : Identifiant du parking.

    Entrée :
    - dict : Informations de l'abonnement.

    Sortie :
    - dict : Abonnement créé.
    """
    parking = session.get(Parking, parking_id)

    if not parking:
        return {
            "status": "error",
            "message": "PARKING_NOT_FOUND"
        }, 404

    data = request.json

    if not data:
        return {
            "status": "error",
            "message": "NO_DATA"
        }, 400

    person_id = data.get("owner")
    spot_id = data.get("spot")

    if not person_id:
        return {
            "status": "error",
            "message": "INVALID_PERSON"
        }, 400
    
    if not spot_id:
        return {
            "status": "error",
            "message": "INVALID_SPOT"
        }, 400
    
    person = session.get(Person, person_id)

    if not person:
        return {
            "status": "error",
            "message": "PERSON_NOT_FOUND"
        }, 404
    
    spot = session.get(Spot, spot_id)

    if not spot:
        return {
            "status": "error",
            "message": "SPOT_NOT_FOUND"
        }, 404
    
    if spot.is_taken:
        return {
            "status": "error",
            "message": "SPOT_ALREADY_TAKEN"
        }, 400
    
    if spot.subscription:
        return {
            "status": "error",
            "message": "SPOT_ALREADY_RESERVED"
        }, 400
    
    if session.query(Subscription).filter_by(spot_id=spot_id).first():
        return {
            "status": "error",
            "message": "SPOT_ALREADY_RESERVED"
        }, 400
    
    subscription = Subscription(
        person=person,
        spot=spot,
        parking=parking
    )
    subscription.save(session)

    return {
        "status": "success",
        "subscription": {
            "id": subscription.id,
            "person": {
                "id": person.id,
                "first_name": person.first_name,
                "last_name": person.last_name
            },
            "spot": {
                "id": spot.id,
                "tag": spot.tag
            }
        }
    }, 201

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

    cars_bad_parked = [car for car in cars if car.is_bad_parked() and car.spot.parking.id == parking_id]

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

@server.post("/api/cars/create")
def create_car() -> Dict[str, Any]:
    """
    Crée une voiture.

    Entrée :
    - dict : Informations de la voiture.

    Sortie :
    - dict : Voiture créée.
    """
    data = request.json

    if not data:
        return {
            "status": "error",
            "message": "NO_DATA"
        }, 400

    brand = data.get("brand")
    color = data.get("color")
    model = data.get("model")
    license_plate = data.get("license_plate")
    owner_id = data.get("owner")

    if not brand or len(brand) < 1:
        return {
            "status": "error",
            "message": "INVALID_BRAND"
        }, 400
    
    if not color or len(color) < 1:
        return {
            "status": "error",
            "message": "INVALID_COLOR"
        }, 400

    if not model or len(model) < 1:
        return {
            "status": "error",
            "message": "INVALID_MODEL"
        }, 400

    if not license_plate or not re.match(r"^[A-Z]{2}[0-9]{3}[A-Z]{2}$", license_plate):
        return {
            "status": "error",
            "message": "INVALID_LICENSE_PLATE"
        }, 400
    
    if not owner_id:
        return {
            "status": "error",
            "message": "INVALID_OWNER"
        }, 400
    
    owner = session.get(Person, owner_id)

    if not owner:
        return {
            "status": "error",
            "message": "OWNER_NOT_FOUND"
        }, 404
    
    if session.query(Car).filter_by(license_plate=license_plate).first():
        return {
            "status": "error",
            "message": "CAR_ALREADY_EXISTS"
        }, 400
    
    car = Car(
        license_plate=license_plate,
        brand=brand,
        model=model,
        color=color,
        owner=owner
    )

    car.save(session)

    return {
        "status": "success",
        "car": car.to_dict()
    }, 201

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
        "car": {
            "id": car.id,
            "brand": car.brand,
            "color": car.color,
            "license_plate": car.license_plate,
            "model": car.model,
            "owner": {
                "id": car.owner.id,
                "first_name": car.owner.first_name,
                "last_name": car.owner.last_name
            },
            "spot": {
                "id": car.spot.id if car.spot else None,
                "tag": car.spot.tag if car.spot else None,
            },
            "parking": {
                "id": car.spot.parking.id if car.spot else None,
                "name": car.spot.parking.name if car.spot else None
            },
            "bad_parked": car.is_bad_parked(),
        }
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

@server.post("/api/persons/create")
def create_person() -> Dict[str, Any]:
    """
    Crée une personne.

    Entrée :
    - dict : Informations de la personne.

    Sortie :
    - dict : Personne créée.
    """
    data = request.json

    if not data:
        return {
            "status": "error",
            "message": "NO_DATA"
        }, 400

    first_name = data.get("firstName")
    last_name = data.get("lastName")
    birth_date = data.get("birthDate")

    if not first_name or len(first_name) < 1:
        return {
            "status": "error",
            "message": "INVALID_FIRST_NAME"
        }, 400
    
    if not last_name or len(last_name) < 1:
        return {
            "status": "error",
            "message": "INVALID_LAST_NAME"
        }, 400
    
    if not birth_date or not re.match(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$", birth_date):
        return {
            "status": "error",
            "message": "INVALID_BIRTH_DATE"
        }, 400
    
    person = Person(
        first_name=first_name,
        last_name=last_name,
        birth_date=birth_date
    )

    person.save()

    return {
        "status": "success",
        "person": person.to_dict()
    }, 201

@server.get("/api/persons/<person_id>")
def get_person(person_id: str) -> Dict[str, Any]:
    """
    Récupère une personne.

    Paramètres :
    - person_id (str) : Identifiant de la personne.

    Sortie :
    - dict : Personne
    """
    person = session.get(Person, person_id)

    if not person:
        return {
            "status": "error",
            "message": "PERSON_NOT_FOUND"
        }, 404

    return {
        "status": "success",
        "person": {
            "id": person.id,
            "first_name": person.first_name,
            "last_name": person.last_name,
            "birth_date": person.birth_date,
            "subscriptions": [subscription.to_dict() for subscription in person.subscriptions],
            "cars": [car.to_dict() for car in person.cars]
        }
    }, 200

if __name__ == "__main__":
    server.run(debug=True, port=8000)
