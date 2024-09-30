from utils.uuid import uuid_v4
from typing import TYPE_CHECKING, List
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from utils.sqlalchemy import Base, Session as session

# Importation conditionnelle pour éviter les problèmes de dépendances circulaires
if TYPE_CHECKING:
    from classes import Car, Subscription, Parking

class Person(Base):
    __tablename__ = 'persons'
    
    # Définition des colonnes de la table 'persons'
    id = Column(String, primary_key=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    birth_date = Column(String, nullable=False)

    # Définition des relations avec les autres tables
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

        # Génération d'un UUID pour l'identifiant unique de la personne
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

        # Conversion de l'objet Person en dictionnaire
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
        - parking (Parking) : Parking auquel la personne souhaite s'abonner.
        """

        from classes.subscription import Subscription
        
        # Vérifie s'il y a une place disponible dans le parking
        if parking.get_available_spot():
            spot = parking.get_available_spot()
            # Crée un nouvel abonnement
            subscription = Subscription(
                person=self,
                parking=parking,
                spot=spot
            )
            # Associe l'abonnement à la place de parking
            spot.subscription = subscription
            # Ajoute l'abonnement à la liste des abonnements de la personne et du parking
            self.subscriptions.append(subscription)
            parking.subscriptions.append(subscription)

            # Sauvegarde les modifications dans la base de données
            self.save(session)
            parking.save(session)
            subscription.save(session)
            spot.save(session)
            
            return subscription