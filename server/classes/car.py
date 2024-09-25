from models.car import CarModel
from utils.uuid import uuidV4
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from classes import Person, Spot

class Car(CarModel):
    def __init__(
            self,
            license_plate: str,
            brand: str,
            model: str, 
            color: str,
            owner: 'Person'
        ) -> None:
        """
        Initialisation de la classe Car.

        Paramètres :
        - license_plate (str) : Numéro de plaque d'immatriculation du véhicule.
        - brand (str) : Marque du véhicule.
        - model (str) : Modèle spécifique du véhicule.
        - color (str) : Couleur du véhicule.
        - owner (Person) : Propriétaire du véhicule, représenté par une instance de la classe Person.
        """
        
        self.id: str = uuidV4()
        self.license_plate = license_plate
        self.brand = brand
        self.model = model
        self.color = color
        self.owner = owner
        self.spot: Optional['Spot'] = None

        self.owner.cars.append(self)

    def to_dict(self) -> dict:
        """
        Convertit l'objet en dictionnaire.

        Sortie :
        - dict : Dictionnaire contenant les informations de l'objet.
        """

        return {
            "id": self.id,
            "license_plate": self.license_plate,
            "brand": self.brand,
            "model": self.model,
            "color": self.color,
            "owner": self.owner.id,
            "spot": self.spot.id if self.spot else None
        }