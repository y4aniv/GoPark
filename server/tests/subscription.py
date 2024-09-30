import unittest
from unittest.mock import MagicMock
from classes import Subscription

class TestSubscription(unittest.TestCase):

    def setUp(self):
        self.mock_person = MagicMock()
        self.mock_person.id = 'person-123'
        
        self.mock_parking = MagicMock()
        self.mock_parking.id = 'parking-456'
        
        self.mock_spot = MagicMock()
        self.mock_spot.id = 'spot-789'
        
        self.subscription = Subscription(
            person=self.mock_person,
            parking=self.mock_parking,
            spot=self.mock_spot
        )

    def test_subscription_initialization(self):
        self.assertEqual(self.subscription.person, self.mock_person)
        self.assertEqual(self.subscription.parking, self.mock_parking)
        self.assertEqual(self.subscription.spot, self.mock_spot)
        self.assertIsNotNone(self.subscription.id)

    def test_to_dict(self):
        expected_dict = {
            "id": self.subscription.id,
            "person": 'person-123',
            "parking": 'parking-456',
            "spot": 'spot-789'
        }
        self.assertEqual(self.subscription.to_dict(), expected_dict)

if __name__ == '__main__':
    unittest.main()