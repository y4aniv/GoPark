from utils.uuid import uuidV4
from typing import TYPE_CHECKING, Optional
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from utils.sqlalchemy import Base, session

if TYPE_CHECKING:
    from classes import Person, Spot

class Car(Base):
    __tablename__ = 'cars'
    
    id = Column(String, primary_key=True)
    license_plate = Column(String, nullable=False)
    brand = Column(String, nullable=False)
    model = Column(String, nullable=False)
    color = Column(String, nullable=False)

    owner_id = Column(String, ForeignKey('persons.id'))
    owner = relationship('Person', back_populates='cars', uselist=False, enable_typechecks=False)

    spot = relationship('Spot', back_populates='car', enable_typechecks=False, uselist=False)

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
    
    def park(self, spot: 'Spot') -> 'Car':
        """
        Gare la voiture dans une place de parking.

        Paramètres :
        - spot (Spot) : Place de parking où garer la voiture.

        Sortie :
        - Car : Voiture garée.
        """
        self.spot = spot
        spot.car = self
        spot.is_taken = True

        self.save(session)

        return self