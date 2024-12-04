# installe nvm (Gestionnaire de version node)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

# activate profile environment variables 
source ~/.bashrc

# télécharger et installer Node.js (il peut être nécessaire de redémarrer le terminal)
nvm install 22

# vérifie que la bonne version de Node.js est présente dans l'environnement
node -v # devrait imprimer `v22.12.0`

# vérifie que la bonne version de npm est présente dans l'environnement
npm -v # devrait imprimer `10.9.0`