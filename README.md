Gestion des Poubelles avec Capteurs
Cette application mobile React Native permet de surveiller et d'afficher les données collectées par des capteurs IoT. Elle est conçue pour visualiser les mesures telles que la distance des déchets (en cm) et le niveau de gaz (en ppm) à l'aide de graphiques interactifs et d'une interface utilisateur moderne.

Fonctionnalités
Affichage des données en temps réel :
Distance des déchets (en cm).
Niveau de gaz détecté (en ppm).
Graphiques interactifs :
Graphique en ligne pour la distance des déchets.
Graphique en barre pour le niveau de gaz.
Interface professionnelle :
Conception claire et moderne pour une présentation académique.
Dynamique et facile à naviguer.
Technologies utilisées
React Native : Framework principal pour la création de l'application mobile.
Firebase Realtime Database : Pour stocker et récupérer les données en temps réel.
react-native-chart-kit : Pour la visualisation des données sous forme de graphiques.
react-native-svg : Librairie pour les graphiques vectoriels.
Installation
Clonez ce dépôt sur votre machine locale :

bash
Copier le code
git clone https://github.com/votre-utilisateur/gestion-poubelles.git
Installez les dépendances :

bash
Copier le code
npm install
Configurez Firebase :

Créez un projet Firebase et ajoutez une base de données en temps réel.
Exportez les informations de configuration Firebase et remplacez-les dans le fichier firebaseConfig.js.
Lancez l'application :

bash
Copier le code
npm start
Utilisation
Lancez l'application sur un simulateur ou un appareil réel.
Visualisez les données collectées par les capteurs :
Distance des déchets.
Niveau de gaz (ppm).
Consultez les graphiques pour analyser les tendances.
Structure des fichiers
App.js : Composant principal de l'application.
firebaseConfig.js : Configuration pour la connexion avec Firebase.
styles : Styles définis pour un design moderne et professionnel.
Capture d'écran
(Ajoutez ici des captures d'écran de l'application pour illustrer son interface)

Contributions
Les contributions sont les bienvenues ! Si vous souhaitez améliorer cette application, n'hésitez pas à soumettre une pull request ou à signaler un problème.
