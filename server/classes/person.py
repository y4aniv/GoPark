from utils.uuid import uuid_v4
from typing import TYPE_CHECKING, List
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from utils.sqlalchemy import Base, Session as session

if TYPE_CHECKING:
    from classes import Car, Subscription, Parking

class Person(Base):
    __tablename__ = 'persons'
    
    id = Column(String, primary_key=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    birth_date = Column(String, nullable=False)

    cars = relationship('Car', back_populates='owner', enable_typechecks=False, lazy=True)
    subscriptions = relationship('Subscription', back_populates='person', enable_typechecks=False, lazy=True)

    def __init__(
            self, 
            first_name: str,
            last_name: str,
            birth_date: str
        ) -> None:
        """
        Initialisation de la classe Person.

        Paramètres :
        - first_name (str) : Prénom de la personne.
        - last_name (str) : Nom de famille de la personne.
        - birth_date (str) : Date de naissance de la personne. (format: "YYYY-MM-DD")
        """

        self.id: str = uuid_v4()
        self.first_name = first_name
        self.last_name = last_name
        self.birth_date = birth_date
        self.cars: List['Car'] = []
        self.subscriptions: List['Subscription'] = []

    def to_dict(self) -> dict:
        """
        Convertit l'objet en dictionnaire.

        Sortie :
        - dict : Dictionnaire contenant les informations de l'objet.
        """

        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "birth_date": self.birth_date,
            "cars": [car.id for car in self.cars],
            "subscriptions": [subscription.id for subscription in self.subscriptions]
        }
    
    def subscribe(self, parking: 'Parking'):
        """
        Abonne une personne à un parking.

        Paramètres :
        - person (Person) : Personne à abonner.
        """

        from classes.subscription import Subscription
        
        if parking.get_available_spot():
            spot = parking.get_available_spot()
            subscription = Subscription(
                person=self,
                parking=parking,
                spot=spot
            )
            spot.subscription = subscription
            self.subscriptions.append(subscription)
            parking.subscriptions.append(subscription)

            self.save(session)
            parking.save(session)
            subscription.save(session)
            spot.save(session)
            
            return subscription