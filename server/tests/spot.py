import unittest
from unittest.mock import MagicMock
from classes import Spot, Parking

class TestSpot(unittest.TestCase):

    def setUp(self):
        self.parking = Parking("parking_123", "1 rue de la Paix", "75000", "Paris", 5, 30)

    def test_spot_initialization(self):
        spot = Spot(level=1, spot=5, parking=self.parking)
        self.assertEqual(spot.level, 1)
        self.assertEqual(spot.spot, 5)
        self.assertEqual(spot.parking, self.parking)
        self.assertEqual(spot.tag, "105")
        self.assertFalse(spot.is_taken)
        self.assertIsNone(spot.car)
        self.assertIsNone(spot.subscription)

    def test_to_dict(self):
        spot = Spot(level=1, spot=5, parking=self.parking)
        spot_dict = spot.to_dict()
        self.assertEqual(spot_dict["id"], spot.id)
        self.assertEqual(spot_dict["level"], 1)
        self.assertEqual(spot_dict["spot"], 5)
        self.assertEqual(spot_dict["parking"], self.parking.id)
        self.assertEqual(spot_dict["tag"], "105")
        self.assertFalse(spot_dict["is_taken"])
        self.assertIsNone(spot_dict["car"])
        self.assertIsNone(spot_dict["subscription"])

if __name__ == '__main__':
    unittest.main()