# BatiBid — Editorial Real Estate Design System 🇧🇯

Ce document formalise les fondations de marque, les principes visuels, la palette de couleurs et le système typographique de BatiBid.

---

## 1. Identité & Philosophie de Marque

BatiBid est la plateforme PropTech de référence en Afrique de l'Ouest (Bénin). Son identité allie le prestige institutionnel, l'ancrage territorial béninois (teintes chaudes de latérite et terre cuite) et les standards du design éditorial international (Airbnb Luxe, Colonies, Beanstock, Virgil).

- **Positionnement** : *Le patrimoine immobilier, pensé comme un actif.*
- **Personnalité** : Élégant, Institutionnel, Sécurisé, Innovant, Transparent.
- **Direction Artistique** : **Editorial Real Estate** — Titres sculptés avec empattements (*Fraunces*), corps de texte ultra-lisible et moderne (*Geist*), données financières précises (*JetBrains Mono*), contrastes chaleureux (Terracotta sur Crème et Brun profond).

---

## 2. Palette de Couleurs & Tokens CSS

```css
:root {
  color-scheme: light;

  /* Teintes Primaires (Terracotta Béninois) */
  --clr-primary: #D9571E;          /* Couleur maîtresse, CTA et accents majeurs */
  --clr-primary-dark: #C34E1B;     /* État survol (hover) */
  --clr-primary-deep: #B84718;     /* Contraste AA garanti sur fonds clairs */
  --clr-primary-soft: #F2D9C6;     /* Badges, fonds légers et tags */
  --first-color: #D9571E;

  /* Teintes Sombres & Boisées (Brun Profond) */
  --clr-dark: #3B1F0B;             /* Typographie principale, structure, autorité */
  --clr-dark-soft: #5A4538;        /* Sous-titres et descriptions secondaires */
  --clr-dark-bg: #1A1A1A;          /* Fond des sections sombres et footer */
  --clr-card-bg: #2C2C2C;          /* Cartes sombres et dashboards */

  /* Fonds & Surfaces Chaleureuses (Crème Doux) */
  --clr-light: #FFF9F2;            /* Fond principal de page (Level 0) */
  --clr-light-2: #FCF6EE;          /* Surfaces de cartes et sections alternées */
  --white: #FFFFFF;                /* Surfaces pures et conteneurs détachés */

  /* Bordures Subtiles */
  --clr-border: rgba(59, 31, 11, 0.12);
  --clr-border-strong: rgba(59, 31, 11, 0.22);

  /* Niveaux de Gris Neutres */
  --gray-100: #F7F7F8;
  --gray-200: #EEEEEE;
  --gray-300: #E2E2E2;
  --gray-400: #DADADA;
  --gray-500: #8B7168;
  --gray-600: #5A5A5D;

  /* Statuts & Validation Foncier */
  --success: #2E7D32;              /* Conformité ANDF, Titre validé, rentabilité positive */
  --success-light: #E8F5E9;
  --error: #D32F2F;                /* Alertes, litiges fonciers */
  --error-light: #FFEBEE;
}
```

---

## 3. Typographie Self-Hosted

Toutes les polices sont hébergées localement dans `fonts/` au format `.woff2` pour un rendu instantané et zéro blocage CDN.

### A. Titres & Accroches Éditoriales : `Fraunces`
- **Famille** : `'Fraunces', 'Times New Roman', serif`
- **Poids** : Variable 400 à 800 + Italique 500
- **Usage** : Titres de niveau `h1`, `h2`, citations et mots clés accentués en italique terracotta (`un actif.`, `fiables.`).

### B. Interface, Navigation & Paragraphes : `Geist`
- **Famille** : `'Geist', 'Inter', system-ui, sans-serif`
- **Poids** : 300 à 700
- **Usage** : Corps de texte, labels, boutons, menus de navigation et formulaires.

### C. Données Chiffrées & Indicateurs : `JetBrains Mono`
- **Famille** : `'JetBrains Mono', 'Courier New', monospace`
- **Poids** : 400 à 700
- **Usage** : Valeurs monétaires (FCFA), pourcentages de rentabilité, compteurs et graphiques.

---

## 4. Échelle Typographique

| Style | Police | Taille | Graisse | Hauteur de ligne |
| :--- | :--- | :--- | :--- | :--- |
| **Headline XL** | Fraunces | 2.5rem – 3.5rem | 800 | 1.15 |
| **Headline LG** | Fraunces | 1.85rem – 2.5rem | 700 | 1.25 |
| **Headline MD** | Fraunces | 1.35rem – 1.65rem | 600 | 1.35 |
| **Body LG** | Geist | 1.05rem – 1.15rem | 400 | 1.70 |
| **Body MD** | Geist | 0.90rem – 0.98rem | 400 | 1.65 |
| **Label LG** | Geist | 0.80rem | 700 | 1.40 (Uppercase) |
| **Data Mono** | JetBrains Mono | 0.85rem – 1.5rem | 700 | 1.20 |

---

## 5. Rayons de Courbure & Ombres

```css
/* Rayons */
--radius-sm: 6px;    /* Boutons compacts, inputs, tags */
--radius: 14px;      /* Cartes standards, menus déroulants */
--radius-lg: 24px;   /* Grands conteneurs, bannières CTA, vitrines */
--radius-xl: 36px;   /* Grandes découpes asymétriques architecturales */
--radius-full: 9999px; /* Pills, avatars, boutons circulaires */

/* Ombres */
--shadow-sm: 0 1px 2px rgba(59, 31, 11, .04), 0 2px 4px rgba(59, 31, 11, .04);
--shadow-md: 0 8px 24px rgba(59, 31, 11, .08), 0 2px 6px rgba(59, 31, 11, .04);
--shadow-lg: 0 24px 48px rgba(59, 31, 11, .12), 0 8px 16px rgba(59, 31, 11, .06);
--shadow-warm: 0 20px 40px rgba(217, 87, 30, .18); /* Ombre signature BatiBid */
--shadow-dark: 0px 10px 40px rgba(0, 0, 0, 0.12);
```

---

## 6. Composants Signature de la Landing Page d'Accueil

1. **Hero Split Architectural** :
   - Accroche forte avec mots en italique terre cuite.
   - Double CTA : Principal terracotta (`Découvrir nos solutions →`) + Secondaire outline avec icône (`Voir une démonstration ⊙`).
   - Visuel asymétrique avec découpe arrondie et 3 cartes métriques flottantes (Rendement 8,7%, Valeur gérée 1,245 Mrd FCFA, Titres vérifiés 320+).
2. **Grille des 5 Expertises** :
   - Cartes horizontales épurées sur fond blanc avec icônes linéaires terracotta : *Gérer*, *Mettre en location*, *Construire ou rénover*, *Sécuriser juridiquement*, *Trouver le bon bien*.
3. **Module Sombre "Données & Portfolio"** :
   - Titre blanc avec emphase en terracotta.
   - Graphique interactif en courbe avec sélecteur temporel (12 mois) et 3 métriques clés (Revenus locatifs, Taux d'occupation 92%, Biens actifs 18).
   - Intérieur contemporain chaleureux en fond.
4. **Section Témoignage d'Autorité & Chiffres Clés** :
   - Citation en grandes lettres serif avec auteur identifié (Diaspora).
   - 4 colonnes métriques avec icônes (2 500+ clients, 8 000+ biens gérés, 100% titres vérifiés, 4,9/5 satisfaction).
5. **Bannière CTA Terracotta** :
   - Bloc chaud enveloppant avec invitation au contact direct et fenêtre visuelle sur villa contemporaine éclairée.