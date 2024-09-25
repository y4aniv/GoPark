from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from utils.sqlalchemy import Base

class CarModel(Base):
    __tablename__ = 'cars'
    
    id = Column(String, primary_key=True)
    license_plate = Column(String, nullable=False)
    brand = Column(String, nullable=False)
    model = Column(String, nullable=False)
    color = Column(String, nullable=False)

    owner_id = Column(String, ForeignKey('persons.id'))
    owner = relationship('PersonModel', back_populates='cars', uselist=False, enable_typechecks=False)

    spot = relationship('SpotModel', back_populates='car', enable_typechecks=False, uselist=False)