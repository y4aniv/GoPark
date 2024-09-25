from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from utils.sqlalchemy import Base

class PersonModel(Base):
    __tablename__ = 'persons'
    
    id = Column(String, primary_key=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    birth_date = Column(String, nullable=False)

    cars = relationship('CarModel', back_populates='owner', enable_typechecks=False)
    subscriptions = relationship('SubscriptionModel', back_populates='person', enable_typechecks=False)