import unittest
from unittest.mock import MagicMock
from classes import Car, Person, Parking, Subscription
from utils.sqlalchemy import Session

class TestCar(unittest.TestCase):

    def setUp(self):
        self.owner = Person("John", "Doe", "2000-01-01")
        self.car = Car("ABC123", "Toyota", "Corolla", "Blue", self.owner)
        self.parking = Parking("Parking Test", "1 rue de la Paix", "75000", "Paris", 5, 30)
        self.subscription = Subscription(Person("Jane", "Doe", "2000-01-01"), self.parking, self.parking.spots[0])

    def test_car_initialization(self):
        self.assertEqual(self.car.license_plate, "ABC123")
        self.assertEqual(self.car.brand, "Toyota")
        self.assertEqual(self.car.model, "Corolla")
        self.assertEqual(self.car.color, "Blue")
        self.assertEqual(self.car.owner, self.owner)
        self.assertIsNone(self.car.spot)

    def test_to_dict(self):
        car_dict = self.car.to_dict()
        self.assertEqual(car_dict["license_plate"], "ABC123")
        self.assertEqual(car_dict["brand"], "Toyota")
        self.assertEqual(car_dict["model"], "Corolla")
        self.assertEqual(car_dict["color"], "Blue")
        self.assertEqual(car_dict["owner"], self.owner.id)
        self.assertIsNone(car_dict["spot"])

    def test_park(self):
        self.car.park(self.parking.spots[0])
        self.assertEqual(self.car.spot, self.parking.spots[0])
        self.assertEqual(self.parking.spots[0].car, self.car)
        self.assertTrue(self.parking.spots[0].is_taken)

    def test_unpark(self):
        self.car.park(self.parking.spots[0])
        self.car.unpark()
        self.assertIsNone(self.car.spot)
        self.assertIsNone(self.parking.spots[0].car)
        self.assertFalse(self.parking.spots[0].is_taken)

    def test_is_bad_parked(self):
        self.car.park(self.parking.spots[0])
        self.assertTrue(self.car.is_bad_parked())

        self.subscription.person = self.car.owner
        self.assertFalse(self.car.is_bad_parked())

if __name__ == '__main__':
    unittest.main()