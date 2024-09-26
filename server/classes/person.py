from utils.uuid import uuidV4
from typing import TYPE_CHECKING, List
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from utils.sqlalchemy import Base

if TYPE_CHECKING:
    from classes import Car, Subscription

class Person(Base):
    __tablename__ = 'persons'
    
    id = Column(String, primary_key=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    birth_date = Column(String, nullable=False)

    cars = relationship('Car', back_populates='owner', enable_typechecks=False)
    subscriptions = relationship('Subscription', back_populates='person', enable_typechecks=False)

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

        self.id: str = uuidV4()
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