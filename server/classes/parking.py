from classes.spot import Spot
from utils.uuid import uuid_v4
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship
from utils.sqlalchemy import Base
from utils.sqlalchemy import session

if TYPE_CHECKING:
    from classes import Subscription

class Parking(Base):
    __tablename__ = 'parkings'
    
    id: str = Column(String, primary_key=True)
    name: str = Column(String, nullable=False)
    address: str = Column(String, nullable=False)
    zip_code: str = Column(String, nullable=False)
    city: str = Column(String, nullable=False)
    levels: int = Column(Integer, nullable=False)
    spots_per_level: int = Column(Integer, nullable=False)

    spots = relationship('Spot', back_populates='parking', enable_typechecks=False)
    subscriptions = relationship('Subscription', back_populates='parking', enable_typechecks=False)

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

        self.id = uuid_v4()
        self.name = name
        self.address = address
        self.zip_code = zip_code
        self.city = city
        self.levels = levels
        self.spots_per_level = spots_per_level
        self.spots: List[Spot] = [
            Spot(level, spot, self)
            for level in range(levels)
            for spot in range(spots_per_level)
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
    
    def get_spots_by_level(self, level: int) -> List[Spot]:
        """
        Récupère les places d'un étage donné.

        Paramètres :
        - level (int) : Numéro de l'étage.

        Sortie :
        - List[Spot] : Liste des places de l'étage donné.
        """
        return [spot for spot in self.spots if spot.level == level]
    
    def get_available_spot(self) -> Optional[Spot]:
        """
        Récupère une place de parking disponible.

        Sortie :
        - Spot : Place de parking disponible ou None si aucune n'est disponible.
        """
        return next((spot for spot in self.spots if not spot.is_taken and not spot.subscription), None)
    
    def get_available_spots(self) -> List[Spot]:
        """
        Récupère les places de parking disponibles.

        Sortie :
        - List[Spot] : Liste des places de parking disponibles.
        """
        return [spot for spot in self.spots if not spot.is_taken and not spot.subscription]
    
    def get_reserved_spots(self) -> List[Spot]:
        """
        Récupère les places de parking réservées.

        Sortie :
        - List[Spot] : Liste des places de parking réservées.
        """
        return [spot for spot in self.spots if spot.subscription]
