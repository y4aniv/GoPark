from models.subscription import SubscriptionModel
from utils.uuid import uuidV4
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from classes import Person, Parking, Spot

class Subscription(SubscriptionModel):
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
        
        self.id: str = uuidV4()
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