import type { FaqItem } from "../components/Faq.astro";

/** Texte brut d'une réponse HTML, pour les données structurées. */
const plain = (html: string) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

export const faqJsonLd = (id: string, items: FaqItem[]) => ({
  "@type": "FAQPage",
  "@id": id,
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: plain(item.answer) },
  })),
});

export const homeFaq: FaqItem[] = [
  {
    question: "La démonstration modifie-t-elle mon ordinateur ?",
    answer: "<p>Non. Toutes les actions du site sont simulées. Seule l’application téléchargée pour votre système peut lancer les opérations, après votre confirmation.</p>",
  },
  {
    question: "Pourquoi une autorisation administrateur peut-elle être demandée ?",
    answer: "<p>Certaines installations, mises à jour et zones protégées nécessitent les droits administrateur. OwlSetup ne les demande que lorsque l’opération en a besoin.</p>",
  },
  {
    question: "Mes documents personnels sont-ils supprimés ?",
    answer: "<p>Non. Le nettoyage protège vos documents et le dossier Téléchargements. La Corbeille n’est vidée que si vous la sélectionnez explicitement.</p>",
  },
  {
    question: "L’historique est-il partagé entre les utilisateurs ?",
    answer: "<p>Non. Les notifications, journaux et rapports restent enregistrés localement dans le profil Windows de chaque utilisateur. Ils ne sont ni partagés avec les autres comptes du PC ni synchronisés en ligne.</p>",
  },
  {
    question: "Quelle différence entre l’installateur et la version portable ?",
    answer: "<p>L’installateur ajoute OwlSetup au menu Démarrer et facilite son lancement quotidien. La version portable fonctionne directement depuis le dossier de votre choix, sans installation.</p>",
  },
  {
    question: "Puis-je installer OwlSetup avec winget ?",
    answer: "<p><strong>Bientôt.</strong> Le manifeste est soumis au catalogue winget et attend sa validation. Dès qu’il sera accepté, la commande <code>winget install owlsetup</code> installera la dernière version stable depuis le dépôt communautaire Windows Package Manager de Microsoft. <code>winget upgrade owlsetup</code> suffira ensuite pour les mises à jour.</p>",
  },
  {
    question: "Pourquoi Windows peut-il afficher un avertissement ?",
    answer: "<p>La signature de code est en cours de mise en place. Une fois OwlSetup référencé, l’installation avec <code>winget install owlsetup</code> évitera cet avertissement, car le fichier ne transite pas par le navigateur. En attendant, téléchargez uniquement depuis la Release GitHub officielle et comparez, si nécessaire, l’empreinte du fichier avec SHA256.txt.</p>",
  },
];
