from models.parking import ParkingModel
from classes.spot import Spot
from utils.uuid import uuidV4
from typing import TYPE_CHECKING, List

if TYPE_CHECKING:
    from classes import Subscription

class Parking(ParkingModel):
    def __init__(
        self, 
        name: str,
        address: str,
        zip_code: str,
        city: str,
        levels: int,
        spots_per_level: int
        ) -> None:
        """
        Initialisation de la classe Parking.

        Paramètres :
        - name (str) : Nom du parking.
        - address (str) : Adresse du parking.
        - zip_code (str) : Code postal du parking.
        - city (str) : Ville du parking.
        - levels (int) : Nombre d'étages du parking.
        - spots_per_level (int) : Nombre de places par étage du parking.
        """

        self.id: str = uuidV4()
        self.name = name
        self.address = address
        self.zip_code = zip_code
        self.city = city
        self.levels = levels
        self.spots_per_level = spots_per_level
        self.spots: List['Spot'] = [
            Spot(level, spot, self)
            for level in range(1, levels + 1)
            for spot in range(0, spots_per_level + 1)
        ]
        self.subscriptions: List['Subscription'] = []

    def to_dict(self) -> dict:
        """
        Convertit l'objet en dictionnaire.

        Sortie :
        - dict : Dictionnaire contenant les informations de l'objet.
        """

        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "zip_code": self.zip_code,
            "city": self.city,
            "levels": self.levels,
            "spots_per_level": self.spots_per_level,
            "spots": [spot.id for spot in self.spots],
            "subscriptions": [subscription.id for subscription in self.subscriptions]
        }