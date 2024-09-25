from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from utils.sqlalchemy import Base

class SubscriptionModel(Base):
    __tablename__ = 'subscriptions'
    
    id = Column(String, primary_key=True)

    person_id = Column(String, ForeignKey('persons.id'))
    person = relationship('PersonModel', back_populates='subscriptions', enable_typechecks=False)

    parking_id = Column(String, ForeignKey('parkings.id'))
    parking = relationship('ParkingModel', back_populates='subscriptions', enable_typechecks=False)

    spot_id = Column(String, ForeignKey('spots.id'))
    spot = relationship('SpotModel', back_populates='subscription', enable_typechecks=False, foreign_keys=[spot_id])