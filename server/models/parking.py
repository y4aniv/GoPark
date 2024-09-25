from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship
from utils.sqlalchemy import Base

class ParkingModel(Base):
    __tablename__ = 'parkings'
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    zip_code = Column(String, nullable=False)
    city = Column(String, nullable=False)
    levels = Column(Integer, nullable=False)
    spots_per_level = Column(Integer, nullable=False)

    spots = relationship('SpotModel', back_populates='parking', enable_typechecks=False)
    subscriptions = relationship('SubscriptionModel', back_populates='parking', enable_typechecks=False)