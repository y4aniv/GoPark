import random

def uuidV4() -> str:
    """
    Génération d'un identifiant UUID v4.

    Sortie :
    - str : Identifiant UUID v4.
    """
    
    def random_hex(digits: int) -> str:
        """
        Génération d'une chaîne hexadécimale aléatoire.

        Paramètres :
        - digits (int) : Nombre de chiffres hexadécimaux à générer.

        Sortie :
        - str : Chaîne hexadécimale aléatoire.
        """
        return ''.join([random.choice('0123456789abcdef') for _ in range(digits)])
    
    return f"{random_hex(8)}-{random_hex(4)}-4{random_hex(3)}-{random.choice('89ab')}{random_hex(3)}-{random_hex(12)}"