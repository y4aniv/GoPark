from utils.uuid import uuid_v4
from typing import TYPE_CHECKING
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from utils.sqlalchemy import Base
from importlib import import_module

# Importations conditionnelles pour éviter les problèmes de dépendances circulaires
if TYPE_CHECKING:
    from classes import Person, Spot, Parking

# Définition de la classe Subscription qui hérite de Base (SQLAlchemy)
class Subscription(Base):
    __tablename__ = 'subscriptions'  # Nom de la table dans la base de données
    
    # Définition des colonnes de la table
    id = Column(String, primary_key=True)  # Colonne ID, clé primaire

    # Clé étrangère vers la table persons
    person_id = Column(String, ForeignKey('persons.id'))
    # Relation avec la classe Person
    person = relationship('Person', back_populates='subscriptions', enable_typechecks=False, lazy=True)

    # Clé étrangère vers la table parkings
    parking_id = Column(String, ForeignKey('parkings.id'))
    # Relation avec la classe Parking
    parking = relationship('Parking', back_populates='subscriptions', enable_typechecks=False, lazy=True)

    # Clé étrangère vers la table spots
    spot_id = Column(String, ForeignKey('spots.id'))
    # Relation avec la classe Spot
    spot = relationship('Spot', back_populates='subscription', enable_typechecks=False, foreign_keys=[spot_id], lazy=True)
    
    # Constructeur de la classe Subscription
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
        
        self.id: str = uuid_v4()  # Génération d'un UUID pour l'ID de l'abonnement
        self.person = person  # Assignation de la personne
        self.parking = parking  # Assignation du parking
        self.spot = spot  # Assignation de la place de parking

    # Méthode pour convertir l'objet en dictionnaire
    def to_dict(self) -> dict:
        """
        Convertit l'objet en dictionnaire.

        Sortie :
        - dict : Dictionnaire contenant les informations de l'objet.
        """

        return {
            "id": self.id,  # ID de l'abonnement
            "person": self.person.id,  # ID de la personne
            "parking": self.parking.id,  # ID du parking
            "spot": self.spot.id  # ID de la place de parking
        }