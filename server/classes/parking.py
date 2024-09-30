from classes.spot import Spot
from utils.uuid import uuid_v4
from typing import TYPE_CHECKING, List
from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship
from utils.sqlalchemy import Base, Session as session

# Importation conditionnelle pour éviter les problèmes de dépendances circulaires
if TYPE_CHECKING:
    from classes import Person, Subscription

class Parking(Base):
    __tablename__ = 'parkings'
    
    # Définition des colonnes de la table 'parkings'
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    zip_code = Column(String, nullable=False)
    city = Column(String, nullable=False)
    levels = Column(Integer, nullable=False)
    spots_per_level = Column(Integer, nullable=False)

    # Définition des relations avec les tables 'Spot' et 'Subscription'
    spots = relationship('Spot', back_populates='parking', enable_typechecks=False, lazy=True)
    subscriptions = relationship('Subscription', back_populates='parking', enable_typechecks=False, lazy=True)

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

        # Génération d'un identifiant unique pour le parking
        self.id: str = uuid_v4()
        self.name = name
        self.address = address
        self.zip_code = zip_code
        self.city = city
        self.levels = levels
        self.spots_per_level = spots_per_level

        # Création des objets Spot pour chaque place de parking
        self.spots: List['Spot'] = [
            Spot(level, spot, self)
            for level in range(levels)
            for spot in range(spots_per_level)
        ]
        # Initialisation de la liste des abonnements
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
    
    def get_spots_by_level(self, level: int) -> List['Spot']:
        """
        Récupère les places d'un étage donné.

        Paramètres :
        - level (int) : Numéro de l'étage.

        Sortie :
        - List[Spot] : Liste des places de l'étage donné.
        """
        return [spot for spot in self.spots if spot.level == int(level)]
    
    def get_available_spot(self) -> 'Spot':
        """
        Récupère une place de parking disponible.

        Sortie :
        - Spot : Place de parking disponible.
        """
        return next((spot for spot in self.spots if not spot.is_taken and not spot.subscription), None)
    
    def get_available_spots(self) -> List['Spot']:
        """
        Récupère les places de parking disponibles.

        Sortie :
        - List[Spot] : Liste des places de parking disponibles.
        """
        return [spot for spot in self.spots if not spot.is_taken and not spot.subscription]
    
    def get_reserved_spots(self) -> List['Spot']:
        """
        Récupère les places de parking réservées.

        Sortie :
        - List[Spot] : Liste des places de parking réservées.
        """
        return [spot for spot in self.spots if spot.subscription]