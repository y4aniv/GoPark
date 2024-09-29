from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session
from sqlalchemy.ext.declarative import DeclarativeMeta
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from sqlalchemy.orm.session import Session as SessionType

# Création de l'engine
engine = create_engine('sqlite:///defaultdb.db')

# Création d'une session thread-safe
SessionFactory = sessionmaker(bind=engine)
Session = scoped_session(SessionFactory)

# Création de la base déclarative
Base = declarative_base()

# Création des tables
Base.metadata.create_all(engine)

def __repr__(self) -> str:
    return f"<{self.__class__.__name__} {self.id}>"

def save(self) -> 'DeclarativeMeta':
    """
    Enregistrement de l'objet dans la base de données.
    """
    session = Session()
    try:
        session.add(self)
        session.commit()
        return self
    except:
        session.rollback()
        raise
    finally:
        session.close()

Base.__repr__ = __repr__
Base.save = save

# Fonction pour obtenir une session
def get_session() -> 'SessionType':
    return Session()

# Fonction pour nettoyer la session après utilisation
def remove_session():
    Session.remove()