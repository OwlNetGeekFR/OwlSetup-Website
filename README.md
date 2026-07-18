# OwlSetup Website

Site officiel statique d’OwlSetup pour Windows.

## Adresse

Le site est publié avec GitHub Pages :

https://owlnetgeekfr.github.io/OwlSetup-Website/

## Sécurité

- Aucun secret, jeton ou identifiant privé n’est utilisé par le site.
- Les exécutables ne sont pas stockés dans ce dépôt.
- Les téléchargements pointent vers les Releases officielles du dépôt `OwlSetup`.
- Les empreintes SHA-256 sont publiées avec chaque Release.

## Développement local

```powershell
python -m http.server 4173
```

Puis ouvrir `http://127.0.0.1:4173/`.

Linux et macOS sont actuellement présentés comme éditions en attente et ne proposent aucun téléchargement.

## Synchronisation automatique

Le workflow `Synchroniser et publier le site` vérifie chaque heure la dernière Release stable de `OwlNetGeekFR/OwlSetup`. Il contrôle la présence de l’installateur, de la version portable et de `SHA256.txt`, actualise `release.json` si nécessaire, puis redéploie GitHub Pages. Aucun jeton partagé entre les deux dépôts n’est nécessaire.
