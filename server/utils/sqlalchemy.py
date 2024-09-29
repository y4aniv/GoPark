from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from sqlalchemy.orm.session import Session as SessionType
    from sqlalchemy.ext.declarative import DeclarativeMeta

# Créer un moteur (ici pour SQLite)
engine = create_engine('sqlite:///defaultdb.db')

# Utilisation de scoped_session pour gérer les sessions par thread
SessionFactory = sessionmaker(bind=engine)
Session = scoped_session(SessionFactory)

# Déclaration de la base
Base = declarative_base()
Base.metadata.create_all(engine)

def __repr__(self) -> str:
    """
    Représentation de l'objet.

    Sortie :
    - str : Représentation de l'objet
    """
    return f"<{self.__class__.__name__} {self.id}>"

def save(self, session: 'SessionType' = None) -> 'DeclarativeMeta':
    """
    Enregistrement de l'objet dans la base de données.

    Paramètres :
    - session (SessionType, optionnel) : Session de la base de données.
      Si aucune session n'est fournie, la session thread-safe est utilisée.

    Sortie :
    - DeclarativeMeta : Objet enregistré dans la base de données.
    """
    if session is None:
        session = Session()  # Utilise la session thread-safe

    session.add(self)
    session.commit()
    return self

def delete(self, session: 'SessionType' = None) -> None:
    """
    Suppression de l'objet de la base de données.

    Paramètres :
    - session (SessionType, optionnel) : Session de la base de données.
      Si aucune session n'est fournie, la session thread-safe est utilisée.
    """
    if session is None:
        session = Session()  # Utilise la session thread-safe

    session.delete(self)
    session.commit()

Base.__repr__ = __repr__
Base.save = save
Base.delete = delete