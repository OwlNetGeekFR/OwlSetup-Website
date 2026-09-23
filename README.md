# OwlSetup Website

Site officiel statique d’OwlSetup pour Windows.

## Adresse

Le site est publié avec GitHub Pages et utilise le domaine officiel :

https://owlsetup.owlnetgeek.fr/

## Sécurité

- Aucun secret, jeton ou identifiant privé n’est utilisé par le site.
- Les exécutables ne sont pas stockés dans ce dépôt.
- Les téléchargements pointent vers les Releases officielles du dépôt `OwlSetup`.
- Les empreintes SHA-256 sont publiées avec chaque Release.

## Développement local

Le site est construit avec [Astro](https://astro.build/) (Node.js 22.12 ou plus récent).

```powershell
npm install
npm run dev      # serveur de développement sur http://localhost:4321/
npm run build    # site statique dans dist/
npm run preview  # prévisualise dist/ avec la CSP réelle
```

- Pages : `src/pages/`, composants : `src/components/`, styles : `src/styles/`.
- Les fichiers servis tels quels (logos, `CNAME`, `robots.txt`…) sont dans `public/`.
- Version, tailles et empreintes SHA-256 sont lues au build depuis `release.json`
  (`src/lib/release.ts`) ; le build échoue si le manifeste est incomplet.
- Le thème clair ou sombre suit le système ; le choix du visiteur est mémorisé.

Linux et macOS sont actuellement présentés comme éditions en attente et ne proposent aucun téléchargement.

## Synchronisation automatique

Le workflow `Synchroniser et publier le site` vérifie chaque heure la dernière Release stable de `OwlNetGeekFR/OwlSetup`. Il contrôle la présence de l’installateur, de la version portable et de `SHA256.txt`, actualise `release.json` si nécessaire, reconstruit le site avec Astro, puis redéploie GitHub Pages. Aucun jeton partagé entre les deux dépôts n’est nécessaire.

## Licence

Le code du site est distribué sous licence MIT. Les marques, noms et logos
présentés restent la propriété de leurs détenteurs respectifs.
