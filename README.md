# GoPark

## Yaniv DOUIEB & Damien ESSER

### Server (Python)
Pour démarrer le serveur, exécutez les étapes suivantes à partir du répertoire `/server` :
1. Installer les dépendances : 
    ```bash
    pip3 install -r requirements.txt
    ```
2. Lancer l'initialisation de la base de données :
    ```bash
    python3 -m scripts.seed
    ```
3. Démarrer le serveur :
    ```bash
    python3 server.py
    ```

### Client (Next.js)
Pour démarrer le client, exécutez les étapes suivantes à partir du répertoire `/client` :
1. Installer les dépendances :
    ```bash
    npm install
    ```
2. Configurer l'URL du serveur dans le fichier `.env`.
3. Lancer le frontend :
    - En mode développement :
        ```bash
        npm run dev
        ```
    - En mode production :
        ```bash
        npm run build
        ```

### Tests (Python)
Pour exécuter les tests, à partir du répertoire `/server` :
1. Utiliser la commande suivante :
    ```bash
    python3 -m tests.[nom_de_la_classe_à_tester]
    ```
