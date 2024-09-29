from utils.uuid import uuid_v4
from typing import TYPE_CHECKING
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from utils.sqlalchemy import Base, session

if TYPE_CHECKING:
    from classes import Person, Spot, Parking

class Subscription(Base):
    __tablename__ = 'subscriptions'
    
    id: str = Column(String, primary_key=True)

    person_id: str = Column(String, ForeignKey('persons.id'))
    person = relationship('Person', back_populates='subscriptions', enable_typechecks=False)

    parking_id: str = Column(String, ForeignKey('parkings.id'))
    parking = relationship('Parking', back_populates='subscriptions', enable_typechecks=False)

    spot_id: str = Column(String, ForeignKey('spots.id'))
    spot = relationship('Spot', back_populates='subscription', enable_typechecks=False, foreign_keys=[spot_id])
    
    def __init__(
            self, 
            person: 'Person',
            parking: 'Parking',
            spot: 'Spot'
        ) -> None:
        """
        Initialisation de la classe Subscription.

        Paramètres :
        - person (Person) : Personne abonnée, représentée par une instance de la classe Person.
        - parking (Parking) : Parking où la personne est abonnée, représenté par une instance de la classe Parking.
        - spot (Spot) : Place de parking attribuée à la personne, représentée par une instance de la classe Spot.
        """
        self.id = uuid_v4()
        self.person = person
        self.parking = parking
        self.spot = spot

    def to_dict(self) -> dict:
        """
        Convertit l'objet en dictionnaire.

        Sortie :
        - dict : Dictionnaire contenant les informations de l'objet.
        """
        return {
            "id": self.id,
            "person": self.person.id,
            "parking": self.parking.id,
            "spot": self.spot.id
        }
    
    def delete(self) -> None:
        """
        Supprime l'abonnement.
        """
        # Remove the subscription from relationships
        self.parking.subscriptions.remove(self)
        self.person.subscriptions.remove(self)
        self.spot.subscription = None

        # Delete the subscription from the session
        session.delete(self)
        session.commit()
