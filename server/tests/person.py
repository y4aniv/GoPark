import unittest
from datetime import datetime
from classes import Person, Parking, Subscription, Spot

class TestPerson(unittest.TestCase):

    def setUp(self):
        self.person = Person(
            first_name="John",
            last_name="Doe",
            birth_date="1990-01-01"
        )

        self.parking = Parking(
            name="Test Parking",
            address="123 Test St",
            zip_code="12345",
            city="Test City",
            levels=2,
            spots_per_level=2
        )

    def test_initialization(self):
        self.assertEqual(self.person.first_name, "John")
        self.assertEqual(self.person.last_name, "Doe")
        self.assertEqual(self.person.birth_date, "1990-01-01")
        self.assertIsInstance(self.person.id, str)
        self.assertEqual(self.person.cars, [])
        self.assertEqual(self.person.subscriptions, [])

    def test_to_dict(self):
        person_dict = self.person.to_dict()
        self.assertEqual(person_dict["first_name"], "John")
        self.assertEqual(person_dict["last_name"], "Doe")
        self.assertEqual(person_dict["birth_date"], "1990-01-01")
        self.assertEqual(person_dict["cars"], [])
        self.assertEqual(person_dict["subscriptions"], [])

    def test_subscribe(self):

        self.person.subscribe(self.parking)

        self.assertEqual(len(self.person.subscriptions), 1)
        self.assertEqual(len(self.parking.subscriptions), 1)
        self.assertIsInstance(self.parking.subscriptions[0], Subscription)
        self.assertEqual(self.parking.subscriptions[0].person, self.person)
        self.assertEqual(self.parking.subscriptions[0].parking, self.parking)
        self.assertIsInstance(self.parking.subscriptions[0].spot, Spot)
        self.assertEqual(self.parking.subscriptions[0].spot.subscription, self.parking.subscriptions[0])

if __name__ == '__main__':
    unittest.main()