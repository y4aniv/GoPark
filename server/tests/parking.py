import unittest
from classes import Parking, Spot

class TestParking(unittest.TestCase):

    def setUp(self):
        self.parking = Parking(
            name="Test Parking",
            address="123 Test St",
            zip_code="12345",
            city="Test City",
            levels=2,
            spots_per_level=2
        )

    def test_initialization(self):
        self.assertEqual(self.parking.name, "Test Parking")
        self.assertEqual(self.parking.address, "123 Test St")
        self.assertEqual(self.parking.zip_code, "12345")
        self.assertEqual(self.parking.city, "Test City")
        self.assertEqual(self.parking.levels, 2)
        self.assertEqual(self.parking.spots_per_level, 2)
        self.assertEqual(len(self.parking.spots), 4)
        self.assertEqual(len(self.parking.subscriptions), 0)

    def test_to_dict(self):
        parking_dict = self.parking.to_dict()
        self.assertEqual(parking_dict["name"], "Test Parking")
        self.assertEqual(parking_dict["address"], "123 Test St")
        self.assertEqual(parking_dict["zip_code"], "12345")
        self.assertEqual(parking_dict["city"], "Test City")
        self.assertEqual(parking_dict["levels"], 2)
        self.assertEqual(parking_dict["spots_per_level"], 2)
        self.assertEqual(len(parking_dict["spots"]), 4)
        self.assertEqual(len(parking_dict["subscriptions"]), 0)

    def test_get_spots_by_level(self):
        spots_level_0 = self.parking.get_spots_by_level(0)
        spots_level_1 = self.parking.get_spots_by_level(1)
        self.assertEqual(len(spots_level_0), 2)
        self.assertEqual(len(spots_level_1), 2)

    def test_get_available_spot(self):
        available_spot = self.parking.get_available_spot()
        self.assertIsInstance(available_spot, Spot)
        self.assertFalse(available_spot.is_taken)
        self.assertIsNone(available_spot.subscription)

    def test_get_available_spots(self):
        available_spots = self.parking.get_available_spots()
        self.assertEqual(len(available_spots), 4)
        for spot in available_spots:
            self.assertFalse(spot.is_taken)
            self.assertIsNone(spot.subscription)

    def test_get_reserved_spots(self):
        reserved_spots = self.parking.get_reserved_spots()
        self.assertEqual(len(reserved_spots), 0)

if __name__ == '__main__':
    unittest.main()