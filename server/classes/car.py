from utils.uuid import uuid_v4
from typing import TYPE_CHECKING, Optional
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from utils.sqlalchemy import Base, Session as session

# Importations conditionnelles pour éviter les importations circulaires
if TYPE_CHECKING:
    from classes import Person, Spot

# Définition de la classe Car qui hérite de Base (SQLAlchemy)
class Car(Base):
    __tablename__ = 'cars'  # Nom de la table dans la base de données
    
    # Définition des colonnes de la table
    id = Column(String, primary_key=True)
    license_plate = Column(String, nullable=False)
    brand = Column(String, nullable=False)
    model = Column(String, nullable=False)
    color = Column(String, nullable=False)

    # Clé étrangère et relation avec la table 'persons'
    owner_id = Column(String, ForeignKey('persons.id'))
    owner = relationship('Person', back_populates='cars', uselist=False, enable_typechecks=False, lazy=True)

    # Relation avec la table 'spots'
    spot = relationship('Spot', back_populates='car', enable_typechecks=False, uselist=False, lazy=True)

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
        
        # Initialisation des attributs de l'objet
        self.id: str = uuid_v4()
        self.license_plate = license_plate
        self.brand = brand
        self.model = model
        self.color = color
        self.owner = owner
        self.spot: Optional['Spot'] = None

        # Ajout de la voiture à la liste des voitures du propriétaire
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
        # Associe la voiture à la place de parking et marque la place comme prise
        self.spot = spot
        spot.car = self
        spot.is_taken = True

        # Sauvegarde les modifications dans la base de données
        self.save(session)

        return self
    
    def unpark(self) -> 'Car':
        """
        Désactive la place de parking de la voiture.

        Sortie :
        - Car : Voiture désactivée.
        """
        # Libère la place de parking et dissocie la voiture de la place
        self.spot.is_taken = False
        self.spot.car = None
        self.spot = None

        # Sauvegarde les modifications dans la base de données
        self.save(session)

        return self
    
    def is_bad_parked(self) -> bool:
        """
        Vérifie si la voiture est garée sur une place réservée.

        Sortie :
        - bool : True si la voiture est mal garée, False sinon.
        """
        # Vérifie si la voiture est garée sur une place réservée à une autre personne
        return (self.spot is not None and self.spot.is_taken and 
                self.spot.subscription and 
                self.spot.subscription.person != self.owner)