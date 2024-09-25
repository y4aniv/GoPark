from sqlalchemy import Column, String, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from utils.sqlalchemy import Base

class SpotModel(Base):
    __tablename__ = 'spots'
    
    id = Column(String, primary_key=True)
    level = Column(Integer, nullable=False)
    spot = Column(Integer, nullable=False)
    tag = Column(String, nullable=False)
    is_taken = Column(Boolean, nullable=False)

    parking_id = Column(String, ForeignKey('parkings.id'))
    parking = relationship('ParkingModel', back_populates='spots', uselist=False, enable_typechecks=False)

    car_id = Column(String, ForeignKey('cars.id'))
    car = relationship('CarModel', back_populates='spot', uselist=False, enable_typechecks=False, foreign_keys=[car_id])

    subscription = relationship('SubscriptionModel', back_populates='spot', uselist=False, enable_typechecks=False)