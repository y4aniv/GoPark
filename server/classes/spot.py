from utils.uuid import uuid_v4
from typing import TYPE_CHECKING, Optional
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from utils.sqlalchemy import Base

if TYPE_CHECKING:
    from classes import Car, Parking, Subscription

class Spot(Base):
    __tablename__ = 'spots'
    
    id = Column(String, primary_key=True)
    level = Column(Integer, nullable=False)
    spot = Column(Integer, nullable=False)
    tag = Column(String, nullable=False)
    is_taken = Column(Boolean, nullable=False)

    parking_id = Column(String, ForeignKey('parkings.id'))
    parking = relationship('Parking', back_populates='spots', uselist=False, enable_typechecks=False, lazy=True)

    car_id = Column(String, ForeignKey('cars.id'))
    car = relationship('Car', back_populates='spot', uselist=False, enable_typechecks=False, foreign_keys=[car_id], lazy=True)

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

        self.id: str = uuid_v4()
        self.level = level
        self.spot = spot
        self.parking = parking
        self.tag: str = f"{level}{str(spot).zfill(len(str(parking.spots_per_level)))}"
        self.is_taken: bool = False
        self.car: Optional['Car'] = None
        self.subscription: Optional['Subscription'] = None

    def to_dict(self) -> dict:
        """
        Convertit l'objet en dictionnaire.

        Sortie :
        - dict : Dictionnaire contenant les informations de l'objet.
        """

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