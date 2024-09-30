from utils.uuid import uuid_v4
from typing import TYPE_CHECKING, Optional
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from utils.sqlalchemy import Base

# Importation conditionnelle pour éviter les problèmes de dépendances circulaires
if TYPE_CHECKING:
    from classes import Car, Parking, Subscription

# Définition de la classe Spot qui hérite de Base (SQLAlchemy)
class Spot(Base):
    __tablename__ = 'spots'  # Nom de la table dans la base de données
    
    # Définition des colonnes de la table
    id = Column(String, primary_key=True)  # Identifiant unique de la place
    level = Column(Integer, nullable=False)  # Niveau de l'étage où se trouve la place
    spot = Column(Integer, nullable=False)  # Numéro de la place
    tag = Column(String, nullable=False)  # Tag unique de la place
    is_taken = Column(Boolean, nullable=False)  # Indicateur si la place est occupée

    # Clé étrangère et relation avec la table Parking
    parking_id = Column(String, ForeignKey('parkings.id'))
    parking = relationship('Parking', back_populates='spots', uselist=False, enable_typechecks=False, lazy=True)

    # Clé étrangère et relation avec la table Car
    car_id = Column(String, ForeignKey('cars.id'))
    car = relationship('Car', back_populates='spot', uselist=False, enable_typechecks=False, foreign_keys=[car_id], lazy=True)

    # Relation avec la table Subscription
    subscription = relationship('Subscription', back_populates='spot', uselist=False, enable_typechecks=False, lazy=True)
    
    def __init__(
            self, 
            level: int,
            spot: int,
            parking: 'Parking'
        ) ->  None:
        """
        Initialisation de la classe Spot.

        Paramètres :
        - level (int) : Niveau de l'étage où se trouve la place.
        - spot (int) : Numéro de la place.
        - parking (Parking) : Parking où se trouve la place, représenté par une instance de la classe Parking.
        """

        self.id: str = uuid_v4()  # Génération d'un identifiant unique
        self.level = level  # Affectation du niveau
        self.spot = spot  # Affectation du numéro de la place
        self.parking = parking  # Affectation du parking
        # Création du tag unique basé sur le niveau et le numéro de la place
        self.tag: str = f"{level}{str(spot).zfill(len(str(parking.spots_per_level)))}"
        self.is_taken: bool = False  # Initialisation de l'indicateur de place occupée
        self.car: Optional['Car'] = None  # Initialisation de la relation avec une voiture
        self.subscription: Optional['Subscription'] = None  # Initialisation de la relation avec un abonnement

    def to_dict(self) -> dict:
        """
        Convertit l'objet en dictionnaire.

        Sortie :
        - dict : Dictionnaire contenant les informations de l'objet.
        """

        # Retourne un dictionnaire avec les informations de la place
        return {
            "id": self.id,
            "level": self.level,
            "spot": self.spot,
            "parking": self.parking.id,
            "tag": self.tag,
            "is_taken": self.is_taken,
            "car": self.car.id if self.car else None,
            "subscription": self.subscription.id if self.subscription else None
        }