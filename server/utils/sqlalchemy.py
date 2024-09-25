from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from sqlalchemy.orm.session import Session as SessionType
    from sqlalchemy.ext.declarative import DeclarativeMeta

engine = create_engine('postgresql://avnadmin:AVNS_oqFmHm2dnaUYVb9RUdR@gopark-nursesync.i.aivencloud.com:20305/defaultdb?sslmode=require', 
                       pool_timeout=30,
                       pool_recycle=60
                    )

Session = sessionmaker(bind=engine)
session = Session()

Base = declarative_base()
Base.metadata.create_all(engine)

def __repr__(self) -> str:
    """
    Représentation de l'objet.

    Sortie :
    - str : Représentation de l'objet
    """
    return f"<{self.__class__.__name__} {self.id}>"

def save(self, session: 'SessionType') -> 'DeclarativeMeta':
    """
    Enregistrement de l'objet dans la base de données.

    Paramètres :
    - session (SessionType) : Session de la base de données.

    Sortie :
    - DeclarativeMeta : Objet enregistré dans la base de données.
    """
    session.add(self)
    session.commit()
    return self

Base.__repr__ = __repr__
Base.save = save