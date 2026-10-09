# Guide de refonte intégrale — BatiBid

Analyse des 10 pages du site (Accueil, Gérer, Mise en location, Construire & rénover, Juridique, Corporate Housing, Private Market, Partenariats, Blog, Contact) · octobre 2026

> Méthode et limites : cette analyse repose sur le contenu et la structure de chaque page. Je n'ai pas pu mesurer la vitesse de chargement ni juger le rendu visuel réel sur mobile : ces points sont signalés « à vérifier ».

## 1. Diagnostic en 30 secondes

Le site a de vraies forces : un positionnement clair (propriétaires, diaspora, professionnels), des offres bien pensées, une couleur de marque identifiable et un ton rassurant. Le problème n'est pas le fond, c'est le volume et la répétition.

- **Pages trop longues** : la plupart empilent 10 à 15 blocs. Construire & rénover en compte une quinzaine, dont deux sous-parcours (Home Solutions, Building Solutions) de 3 à 4 sous-sections chacun.
- **Offres présentées deux ou trois fois** : sur Gérer, les formules apparaissent en 3 cartes de synthèse, puis en 4 cartes détaillées, puis dans un tableau comparatif, puis dans la liste du formulaire.
- **Chiffres et prix contradictoires** d'une page à l'autre (détail en section 8).
- **Éléments techniques embarqués dans toutes les pages** : fenêtre de confirmation Mobile Money avec code PIN, alerte générique, estimateur de loyer, recherche personnalisée, formulaire Corporate Housing, et une seconde copie du menu.
- **Peu de pages ont un appel à l'action dominant** : le visiteur doit lire beaucoup avant de savoir quoi faire.

## 2. Objectif et principes directeurs

**Objectif** : un site premium et épuré qui répond en moins de 10 secondes à trois questions. Qu'est-ce que c'est ? Est-ce pour moi ? Que dois-je faire maintenant ?

1. **Une section = un message.** Si elle n'aide pas la décision du visiteur, elle part ou descend dans une FAQ.
2. **Une offre = un seul endroit de présentation détaillée.** Ailleurs, un simple lien.
3. **Un seul appel à l'action principal par page**, répété à l'identique.
4. **Peu de texte, beaucoup d'espace** : un titre, une phrase (20 à 25 mots), trois puces maximum par bloc.
5. **Les détails se cachent derrière un geste** (accordéon, onglet, « Voir le détail »), jamais dans le flux principal.
6. **Des preuves réelles ou pas de preuves** : vraies photos, vrais chiffres, cohérents partout.
7. **Mobile d'abord, WhatsApp comme canal naturel.**

**Format cible** : 5 à 7 écrans de défilement sur mobile par page, et environ 40 à 50 % de texte en moins qu'aujourd'hui (objectif de travail, à ajuster).

## 3. Nouvelle architecture

**Navigation principale (6 entrées maximum)**

- Gérer · Louer · Construire · Juridique · Entreprises ▾ (Corporate Housing, Private Market, Partenariats) · Ressources (Blog)
- À droite : *Trouver un bien* (lien vers l'application), *Se connecter*, et un bouton orange **Parler à un conseiller**.
- *S'inscrire* sort de l'en-tête et vit dans le parcours de chaque page.

**Corrections par rapport à l'existant**

- Corporate Housing apparaît deux fois dans l'en-tête actuel (barre principale et menu « Plus ») : le fusionner dans *Entreprises*.
- Le service pour locataires et acheteurs (« Trouver le bon bien ») est absent de l'en-tête : l'ajouter, car c'est une porte d'entrée majeure.
- Pied de page : 4 colonnes (Solutions, Entreprises, Ressources, Contact), de vraies pages légales, et suppression de la seconde copie du menu.

**Liens entre pages** : Mise en location se termine par « Après la location, déléguez la gestion » (vers Gérer) ; les articles de blog se terminent par un appel à l'action lié à leur sujet.

## 4. Système visuel premium

| Élément | Recommandation |
| --- | --- |
| Couleurs | Orange de marque (#D9571E) comme accent unique : boutons, liens, chiffres clés. 80 % de neutres : blanc cassé, anthracite, gris clair. Un fond sombre, une seule fois par page, pour l'impact. Pas de dégradés. |
| Typographie | 2 familles : un titre élégant à contraste (ex. Fraunces ou Playfair Display) et une sans-serif lisible (Inter ou Manrope). Titres 40-56 px sur ordinateur, 30-34 px sur mobile ; texte 16-18 px, interlignage 1,5. |
| Espacement | Grille de 8 px, marges verticales de 96-120 px par section sur ordinateur (64 px sur mobile), conteneur de 1200 px, colonnes de texte limitées à environ 65 caractères. |
| Boutons | Un primaire (orange plein), un secondaire (contour). Jamais plus de deux boutons côte à côte. |
| Cartes | Coins arrondis 12-16 px, bordure fine, pas d'ombre lourde. |
| Images | Photos cohérentes (même lumière, même étalonnage), WebP, chargement différé. Chaque image utilisée une fois par page, idéalement une fois sur tout le site. |
| Mouvement | Apparition douce au défilement (fondu + léger glissement). Pas de compteurs animés partout, pas de vidéo en lecture automatique. |
| Icônes | Un seul jeu, trait fin. |

**Point d'attention accessibilité** : l'orange #D9571E sur fond blanc offre un contraste d'environ 3,9:1 (calcul approximatif). C'est acceptable pour de grands textes et des boutons à texte blanc en gras, mais insuffisant pour du petit texte courant. À vérifier avec un outil de contraste et, si besoin, assombrir légèrement l'orange pour les textes.

## 5. Modèle type d'une page de service

1. **Hero** : titre, une phrase, un CTA principal, un CTA secondaire, une image.
2. **Offres ou solutions** : 3 cartes maximum.
3. **Comment ça marche** : 3 à 4 étapes sur une ligne, une phrase chacune.
4. **Preuve** : un seul bloc (chiffres cohérents, témoignage réel ou réalisations).
5. **FAQ** : 4 à 5 questions repliées.
6. **CTA final** avec formulaire court.

## 6. Refonte page par page

### 6.1 Accueil

**Ordre cible**

1. Hero : titre raccourci, une phrase, deux boutons (*Découvrir nos solutions* / *Parler à un conseiller*), une ligne de preuve (note et nombre de clients).
2. Quatre cartes solutions : Gérer, Louer, Construire, Sécuriser. Dessous, une ligne discrète : Entreprises · Private Market · Trouver un bien.
3. Bandeau de 3 chiffres cohérents.
4. Aperçu du tableau de bord : une capture, trois puces.
5. Un témoignage réel (vraie photo, nom, rôle) ou des logos de partenaires.
6. CTA final avec formulaire à 3 champs.

**À retirer ou déplacer**

- Les 3 cartes tarifaires du hero (Avance Loyers, Gestion Digitale, Gestion Premium) : les tarifs vivent sur la page Gérer.
- La section « Données. Transparence. Performance » avec graphique et chiffres fictifs : elle double l'aperçu du tableau de bord.
- La vidéo : la placer derrière un bouton *Voir la démo* avec image d'aperçu.
- Le second bloc d'appel à l'action (« Donnez à votre patrimoine l'envergure qu'il mérite ») et le formulaire de rappel complet, remplacés par le formulaire court.

### 6.2 Gérer mon patrimoine

Aujourd'hui environ 12 blocs. Cible : 6.

1. Hero : « Votre patrimoine travaille. Pas vous. », deux CTA, trois chiffres.
2. **Les 3 formules** (voir section 7) : seul endroit où elles sont détaillées.
3. **Pourquoi déléguer** : fusionner « Gérer seul peut coûter cher » (4 grandes cartes) et le comparatif de gain en un bloc : trois problèmes en une ligne chacun, et un comparatif à deux colonnes corrigé (section 8).
4. Tableau de bord : un visuel, trois puces.
5. FAQ, et le tableau comparatif détaillé dans un accordéon « Comparer toutes les prestations ».
6. CTA et formulaire court.

**À retirer** : le bloc « Adoptez et respirez » (doublon du CTA), la vidéo en bas de page (un bouton démo dans le hero suffit), les trois cartes de synthèse qui répètent les quatre cartes détaillées.

### 6.3 Mise en location

1. Hero : titre, une phrase, deux CTA, trois chiffres sur une ligne.
2. **Deux formules d'annonce côte à côte** (3 000 FCFA / 30 jours et 6 000 FCFA / 60 jours), la boostée mise en avant.
3. **Méthode en 4 étapes** sur une ligne (fusionner « Shooting » et « Diffusion » en « Mise en valeur et diffusion »).
4. **Réalisations** : garder les 3 cartes (elles prouvent la rapidité), avec des photos différentes pour chaque bien.
5. Une bande « Vous êtes agence ou courtier ? » qui ouvre une section dépliable, au lieu d'un onglet de trois grandes cartes dans la page propriétaire.
6. CTA.

**À vérifier** : les chiffres du bandeau (biens loués, délai moyen, locataires vérifiés) apparaissent à 0 dans la version lue. Il s'agit probablement de compteurs animés ; s'assurer qu'ils atteignent leur valeur sur mobile et connexion lente, ou afficher la valeur finale par défaut.

### 6.4 Construire & rénover (page la plus chargée)

Aujourd'hui : une quinzaine de blocs, deux sous-parcours, un tableau de 10 métiers, un formulaire à 3 onglets, une FAQ de 5 questions.

**Structure recommandée : une page d'orientation et deux sous-pages**

- **/construire** : Hero ; choix en 3 cartes (*Construire du neuf* · *Rénover chez moi* (Home Solutions) · *Entreprise* (Building Solutions)) ; 4 garanties en puces (devis détaillé, paiement par jalons, suivi en direct, contrôle qualité) ; un visuel du tableau de bord ; FAQ de 4 questions ; CTA.
- **Sous-pages Home Solutions et Building Solutions** : les 4 besoins en cartes, le parcours ramené de 7 à 4 étapes, un carrousel d'avant/après (au lieu de 4 blocs).

**À fusionner ou retirer**

- Trois sections expliquent la même chose (« Deux grands métiers », « Construire en toute sérénité », « Rénovation complète ou ponctuelle ») : n'en garder qu'une, visuelle.
- Les 6 cartes de services : garder 4.
- Côté Building : conserver « les deux modes de collaboration » ou « les 4 risques », pas les deux.
- Le tableau des 10 corps de métier : le remplacer par une rangée de 10 icônes, avec le tableau détaillé dans un accordéon.
- **Formulaire** : 3 onglets, 7 natures de demande, une dizaine de champs. Le passer en 2 étapes.

### 6.5 Juridique & foncier

Les 7 « expertises » et les 4 « domaines d'intervention » (17 puces) se recoupent largement.

1. Hero (déjà efficace).
2. **Le sélecteur « Votre situation »**, aujourd'hui au milieu de la page : le monter juste sous le hero, c'est le meilleur élément de la page.
3. **4 domaines en cartes** (Contrats et baux · Litiges et recouvrement · Vérification foncière · Fiscalité) qui absorbent les 7 expertises, avec puces repliables.
4. **Tarifs d'appel visibles** : « Bail dès 25 000 FCFA · Audit de titre dès 45 000 FCFA · Premier diagnostic gratuit ». Aujourd'hui, cette information décisive est cachée dans la FAQ.
5. FAQ de 4 questions (bail verbal, authenticité du titre, coût, confidentialité).
6. CTA.

**À retirer** : le bloc « Une approche rigoureuse » (4 puces génériques) et les doublons de FAQ.

### 6.6 Corporate Housing

La page la mieux structurée du site. Retouches seulement.

- Garder les 3 offres en cartes ; le tableau de synthèse double les cartes : le mettre en accordéon ou le supprimer.
- « Pourquoi BatiBid » : 4 puces d'une ligne.
- Ajouter un « comment ça marche » en 3 temps (brief, sélection, installation) et une preuve (logo ou témoignage d'entreprise).
- **Corriger** : le formulaire propose une « Formule Flexible » et un « Grand Compte +150 salariés » qui n'apparaissent pas sur la page ; l'Employee Housing Pass mentionne « jusqu'à 20 salariés et plus », ce qui est ambigu.

### 6.7 Private Market

Concept et ton premium bien trouvés, mais deux parcours complets cohabitent sur la même page.

- **Hero avec deux grandes entrées** : *Vendre en discrétion* et *Accéder aux opportunités*. Chaque entrée ouvre un panneau ou une sous-page avec 4 à 5 étapes, 3 avantages et un formulaire court.
- **Fusionner** « Comment fonctionne la confidentialité » (3 niveaux) en une seule frise, et « Pourquoi BatiBid » avec les avantages vendeur : discrétion, acquéreurs qualifiés et accompagnement y reviennent trois fois.
- FAQ de 6 à 4 questions.
- **Formulaires** : deux longs formulaires de 8 à 10 champs sont insérés dans la page. Passer à 2 étapes, la qualification fine se faisant par téléphone.
- **Corriger** l'ordre des tranches de budget (80-250 M, 250-500 M, +500 M, puis 40-80 M) et supprimer l'« aperçu de profil acquéreur » purement décoratif.

### 6.8 Partenariats

- Hero, 6 cartes de catégories, 4 étapes sur une ligne, CTA. Les onglets (Promoteurs, Professionnels, Institutions…) doublent les cartes : à supprimer.
- La phrase « BatiBid est la plateforme leader en PropTech au Bénin » est reprise telle quelle sur Partenariats, sur le Blog et dans le pied de page : une fois par page au maximum, et à reformuler (voir section 8).

### 6.9 Blog

- Grille de 3 articles avec filtres par catégorie (Actualités, Conseils).
- **Retirer** le bloc de mission répété et le bloc « Restons en contact » : le pied de page suffit.
- **Corriger** : un modèle d'article avec le texte provisoire « Titre de l'article » est présent dans la page.
- Avec seulement 3 articles, le blog fait léger : en publier au moins 6 avant de le mettre en avant dans le menu, sinon le garder en lien de pied de page. Chaque article se termine par un CTA lié à son sujet (ex. l'article sur les parcelles renvoie vers Juridique).

### 6.10 Contact

- Le formulaire en 3 étapes pour 3 champs est trop lourd : un seul écran (nom, téléphone/WhatsApp, sujet, message).
- WhatsApp devient le CTA principal, puisque c'est déjà le canal central du site.
- Adresse en une ligne, identique partout (section 8).

## 7. Présenter les offres : le cœur de la refonte

### 7.1 Offres propriétaires (page Gérer)

Aujourd'hui : 4 formules (Essentiel 8 %, Premium 10 %, Gestion Digitale 3 %, Avance Loyer 3 %) plus un Pack Duo, réparties sur deux onglets, avec un tableau de 7 lignes. C'est beaucoup de choix pour un nouveau visiteur, et l'Avance Loyers est décrite différemment selon l'endroit.

**Proposition** : 3 colonnes, classées par niveau d'implication du propriétaire.

|  | Digital (3 %) | Essentiel (8 %) | Premium (10 %) — recommandé |
| --- | --- | --- | --- |
| Pour qui | Je gère moi-même, avec les outils | Je délègue la gestion courante | Je délègue tout, zéro impayé |
| Points clés | Encaissement MoMo / Flooz / CB · Quittances automatiques · Relances automatiques | Tout Digital, plus sélection des locataires · États des lieux certifiés · Reporting mensuel | Tout Essentiel, plus garantie loyers impayés (versement le 5) · Dépannage sous 48 h · Gestionnaire dédié |
| Bouton | Digitaliser mes loyers | Choisir Essentiel | Choisir Premium |

Sous les colonnes, une ligne **Option : Avance de loyers (3 %)**, avec la mention « compatible avec Digital : Pack Duo à 5 % au lieu de 6 % », puis un lien *Comparer toutes les prestations* qui déplie le tableau détaillé.

*Cette structure est une proposition : elle suppose que l'Avance de loyers puisse être présentée comme une option plutôt qu'une formule à part entière. À valider avec l'équipe BatiBid.*

**Règles d'affichage**

- Un nom stable par offre partout (accueil, page Gérer, formulaire).
- Prix toujours formulé « % des loyers encaissés ».
- 4 puces maximum par carte ; formule recommandée distinguée (fond sombre + badge), les autres neutres.

### 7.2 Annonces (Mise en location)

Deux cartes côte à côte, l'offre Boostée mise en avant, 3 à 4 puces chacune. Le tarif et la durée en gros caractères.

### 7.3 Construire & rénover

Tout est sur devis : présenter des **parcours par besoin** (neuf, rénover chez moi, entreprise) plutôt qu'un catalogue de métiers. Afficher un engagement unique et visible : « Diagnostic et devis sous 24-48 h ».

### 7.4 Corporate Housing et Private Market

- Corporate Housing : 3 cartes avec prix « à partir de ».
- Private Market : deux entrées (vendeur / acquéreur) ; la mention « honoraires de succès uniquement » mérite d'être visible plus haut qu'en FAQ.

### 7.5 Règle commune à toutes les cartes d'offre

**Nom · Pour qui (une ligne) · Prix · 3 à 4 bénéfices · un bouton.** Rien d'autre.

## 8. Incohérences à corriger avant la refonte

Ce sont des corrections de contenu, gratuites et prioritaires : une refonte visuelle ne les réglera pas.

| # | Sujet | Constat | Action |
| --- | --- | --- | --- |
| 1 | Chiffres clés | Accueil : 2 500+ clients, 8 000+ biens gérés, « 5/5 » et « 4,9/5 ». Gérer : 150+ bailleurs, 420+ biens sous gestion, 98,4 % d'occupation, alors que le tableau de bord affiche 92 %. | Une source unique de chiffres vérifiables, affichés à l'identique partout, avec une date. |
| 2 | Avance Loyers | Accueil : 3 à 12 mois d'avance. Gérer : « jusqu'à 3 mois », « 3 à 6 mensualités » ; l'offre est décrite tantôt comme une avance sur loyers futurs, tantôt comme le préfinancement d'un loyer en retard. | Définir l'offre en une phrase et la répéter à l'identique. |
| 3 | Formules de délégation | Page : Essentiel 8 % et Premium 10 %. Formulaire : « Sérénité 10 % », « Essentiel 8 % », « Premium 12 % ». | Aligner noms et prix du formulaire sur la page. |
| 4 | Exemple de gain | Le comparatif calcule les frais à 8 % (Essentiel) mais promet « Zéro impayé, garanti 100 % », garantie que la page réserve au Premium (10 %). Il annonce « +18 % en moyenne » alors que les chiffres affichés (7 176 000 contre 5 850 000 FCFA) donnent environ +23 %. | Refaire l'exemple en précisant la formule et en corrigeant le calcul. |
| 5 | Délais de réponse | Rappel : 24 h. Contact : 2 h. Corporate : 4 h puis 24 h. Private Market : 2 h puis 24 h. Juridique : 24 h puis 48-72 h. Recherche personnalisée : 12 h. | Une politique claire, uniquement des engagements tenables. |
| 6 | Adresse | Pied de page : « Quartier Haie Vive / Akpakpa ». Contact et Partenariats : « Zone Commerciale Akpakpa, Lot 402 ». | Une seule adresse. |
| 7 | Pages légales | Mentions légales, confidentialité et CGU renvoient toutes vers la page Juridique (le service commercial). | Créer 3 vraies pages, relues par un juriste. |
| 8 | Réseaux sociaux | Les icônes pointent vers linkedin.com et facebook.com (pages génériques). | Vraies pages de marque, ou retrait. |
| 9 | Témoignage et dates | Le témoin « Marc A. » est illustré par une photo de banque d'images ; l'exemple de tableau de bord affiche « 12 mai 2025 ». | Vrai témoin avec accord, ou retrait ; dates cohérentes. |
| 10 | Éléments techniques | Fenêtre Mobile Money / PIN, alerte générique, estimateur et formulaires présents dans toutes les pages ; menu en double. | Charger à la demande ; retirer ce qui n'a pas d'usage public. |
| 11 | Texte provisoire | « Titre de l'article » visible sur le Blog. | Supprimer le modèle. |
| 12 | Titre de la page d'accueil | « Refonte Digitale & Gestion Locative au Bénin » : « refonte digitale » décrit le projet, pas l'offre. | Ex. : « BatiBid — Gestion locative, construction et sécurisation foncière au Bénin ». |
| 13 | Promesses absolues | « Zéro litige », « Sécurité juridique garantie 100 % », « quoi qu'il arrive », « plateforme leader ». | Formulations précises et défendables (conditions, délais, chiffres datés). À faire valider par un juriste. |
| 14 | Images réutilisées | La même villa et le même intérieur reviennent sur plusieurs pages, y compris pour des biens censés être différents (réalisations de Mise en location, étapes de chantier). | Prévoir un lot de photos cohérent, une image par usage. |

## 9. Formulaires et appels à l'action

- **Un seul composant de formulaire** : 3 champs obligatoires (nom, WhatsApp, besoin) ; le reste dans une seconde étape facultative.
- Remplacer la dizaine de formulaires en ligne par **un panneau coulissant** déclenché par le bouton, avec une confirmation unique proposant WhatsApp.
- **Barre d'action fixe en bas sur mobile** : *Parler à un conseiller* (WhatsApp).
- **Un seul bouton WhatsApp flottant**, qui remplace les doublons actuels (« Besoin d'aide ? », « Assistance WhatsApp », « Prendre RDV »).
- **CTA principal par page** : Accueil = *Parler à un conseiller* · Gérer = *Confier mon bien* · Louer = *Déposer mon bien* · Construire = *Demander un devis* · Juridique = *Auditer mon bien* · Corporate = *Recevoir une proposition* · Private Market = *Vendre* ou *Accéder* · Partenariats = *Devenir partenaire*.

## 10. Performance, mobile, SEO

- Images en WebP/AVIF aux bonnes dimensions, chargement différé ; vidéos compressées avec image d'aperçu, jamais en lecture automatique.
- Sortir du chargement initial les scripts et fenêtres qui ne servent pas.
- **À mesurer** : vitesse sur connexion mobile moyenne et téléphone d'entrée de gamme (Lighthouse et test réel). Objectif indicatif : première image visible en moins de 2,5 secondes.
- Un seul H1 par page, titres et méta-descriptions uniques, données structurées d'organisation locale.
- Cibler des requêtes précises par page de service (ex. « gestion locative Cotonou », « vérification titre foncier Bénin »).
- Boutons d'au moins 44 px, navigation au clavier, textes alternatifs utiles.

## 11. Plan de mise en œuvre (indicatif)

| Phase | Durée | Contenu |
| --- | --- | --- |
| 0. Contenu | 1 semaine | Arbitrer chiffres, prix, noms d'offres et promesses (section 8) avec BatiBid. |
| 1. Design | 1-2 semaines | Système visuel (couleurs, typographie, composants) et maquettes Accueil et Gérer. |
| 2. Pages clés | 2-3 semaines | Composants, puis Accueil, Gérer, Mise en location, Construire. |
| 3. Pages restantes | 1-2 semaines | Juridique, Corporate Housing, Private Market, Partenariats, Blog, Contact, pages légales. |
| 4. Recette | 1 semaine | Tests mobile, performance, SEO, mise en ligne, suivi. |

**Si le temps est limité** : 1) corriger les incohérences de la section 8, 2) refondre Accueil et Gérer, 3) Construire & rénover, 4) le reste.

**Indicateurs à suivre après lancement** : clics sur le CTA principal, nombre de formulaires et de conversations WhatsApp, profondeur de défilement, taux de rebond, vitesse de chargement.
