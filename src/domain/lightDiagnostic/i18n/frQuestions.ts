import type { LightDiagnosticQuestion } from "../types";

type FrQuestionPack = Pick<LightDiagnosticQuestion, "domainLabel" | "scenario" | "choices" | "explanation">;

export const LIGHT_DIAGNOSTIC_FR: Record<string, FrQuestionPack> = {
  "ld-react-01": {
    domainLabel: "React / TypeScript",
    scenario:
      "Une liste se re-rend à chaque frappe dans une zone de recherche car l'état parent est mis à jour. Les enfants sont des composants purs coûteux mais se re-rendent quand même. Quelle est la correction la plus probable ?",
    choices: [
      "Déplacer l'état de recherche dans chaque enfant pour que les mises à jour restent locales",
      "Stabiliser les props des enfants (memo + useCallback/useMemo pour les handlers et les données dérivées passées)",
      "Remplacer React par une bibliothèque de DOM virtuel qui batch moins",
      "Forcer shouldComponentUpdate à toujours retourner false sur les enfants",
    ],
    explanation:
      "Des références de props instables annulent memo. Localiser l'état dans chaque enfant casse la source unique de vérité pour la recherche.",
  },
  "ld-react-02": {
    domainLabel: "React / TypeScript",
    scenario:
      "StrictMode invoque les effets deux fois en développement. Un effet fetch au montage crée des abonnements dupliqués en prod après un mauvais merge. Meilleure prévention ?",
    choices: [
      "Désactiver StrictMode uniquement dans les builds de production",
      "Utiliser un AbortController / un cleanup qui annule le travail en cours et sécuriser une configuration idempotente",
      "Déplacer le fetch vers window.onload global",
      "Remplacer useEffect par useLayoutEffect pour n'exécuter qu'une fois",
    ],
    explanation:
      "Le bon pattern est des effets annulables avec cleanup ; StrictMode expose l'absence de cleanup, pas la cause racine.",
  },
  "ld-react-03": {
    domainLabel: "React / TypeScript",
    scenario:
      "TypeScript affine une union discriminée dans un switch, mais un handler partagé élargit le type à l'union. Quelle approche de typage préserve l'exhaustivité ?",
    choices: [
      "Caster en any dans le handler",
      "Utiliser un handler générique typé par cas ou des fonctions séparées par variante",
      "Désactiver strictNullChecks pour ce fichier",
      "Utiliser un enum au lieu d'une union",
    ],
    explanation: "Des handlers par variante ou des génériques préservent l'affinement ; les casts effacent la sécurité.",
  },
  "ld-react-04": {
    domainLabel: "React / TypeScript",
    scenario:
      "Fonctionnalités concurrentes : une transition met à jour un grand tableau pendant la saisie d'un filtre. Les utilisateurs voient brièvement des résultats de filtre obsolètes. Compromis attendu et atténuation ?",
    choices: [
      "Désactiver entièrement le rendu concurrent",
      "Marquer les mises à jour du filtre comme urgentes et différer le tableau avec startTransition + valeur différée",
      "Debouncer le clavier à une fois par minute",
      "Déplacer le tableau sur canvas",
    ],
    explanation:
      "Saisie utilisateur urgente vs rendu coûteux différé : c'est le pattern concurrent prévu.",
  },
  "ld-react-05": {
    domainLabel: "React / TypeScript",
    scenario:
      "Une librairie de formulaire stocke l'état des champs dans des refs pour éviter les re-renders, mais les messages d'erreur ne se mettent jamais à jour. Quel est le problème sous-jacent ?",
    choices: [
      "Les refs ne peuvent pas contenir de chaînes",
      "L'UI dérivée des refs doit déclencher un chemin de rendu (state ou abonnement à un store externe)",
      "TypeScript bloque les mises à jour de ref",
      "Les erreurs doivent utiliser des class components",
    ],
    explanation:
      "Les refs mutent sans planifier de rendu ; les patterns validés exposent un état de champ observable.",
  },
  "ld-django-01": {
    domainLabel: "Python / Django",
    scenario:
      "Une requête ORM dans une boucle provoque 200 requêtes sur une page liste. Le queryset utilise déjà select_related pour la FK. Quelle est la prochaine correction probable ?",
    choices: [
      "Passer uniquement au SQL brut",
      "Ajouter prefetch_related pour les collections M2M inversées ou FK inversées accédées dans la boucle",
      "Désactiver DEBUG",
      "Mettre en cache tout le processus Python",
    ],
    explanation: "select_related couvre les jointures FK ; les relations inverses nécessitent prefetch_related.",
  },
  "ld-django-02": {
    domainLabel: "Python / Django",
    scenario:
      "Deux tâches Celery mettent à jour la même ligne en read-modify-write sans verrou. Des mises à jour perdues sporadiques apparaissent sous charge. Approche la plus sûre côté Django ?",
    choices: [
      "Utiliser select_for_update dans transaction.atomic autour de la section critique",
      "Augmenter la concurrence Celery pour finir plus vite",
      "Stocker les compteurs uniquement dans Redis sans DB",
      "Mettre ATOMIC_REQUESTS à False globalement",
    ],
    explanation: "Un verrou au niveau ligne dans un bloc atomic sérialise les mises à jour conflictuelles.",
  },
  "ld-django-03": {
    domainLabel: "Python / Django",
    scenario:
      "Une vue renvoie 403 pour POST mais GET fonctionne. Middleware CSRF activé, cookie de session présent. Client mobile utilise une API avec en-tête JWT. Cause la plus plausible ?",
    choices: [
      "JWT remplace CSRF pour les formulaires navigateur authentifiés par session ; le client API doit utiliser un token CSRF ou exempte l'endpoint intentionnellement",
      "GET contourne toujours l'auth",
      "Django bloque POST le dimanche",
      "L'ordre des middlewares est sans importance",
    ],
    explanation:
      "Un POST avec session attend CSRF ; les chemins d'auth par token diffèrent des formulaires navigateur.",
  },
  "ld-django-04": {
    domainLabel: "Python / Django",
    scenario:
      "Une migration ajoute une colonne non nullable à une table de 50 M lignes. La fenêtre de déploiement est courte. Séquence à plus faible risque ?",
    choices: [
      "Ajouter une colonne nullable, backfill par lots, puis imposer NOT NULL dans une migration séparée",
      "Ajouter non-null avec default en une étape en pleine charge",
      "Supprimer la table et la recréer",
      "Utiliser RunPython pour verrouiller la table pendant des heures",
    ],
    explanation:
      "Expand-backfill-contract évite les verrous longs et les réécritures de table lorsque c'est possible.",
  },
  "ld-django-05": {
    domainLabel: "Python / Django",
    scenario:
      "Les signals se déclenchent à chaque save et lancent des appels HTTP externes, ralentissant les écritures. Refactorisation préférée ?",
    choices: [
      "Désactiver les signals globalement",
      "Déplacer les effets de bord vers une couche service explicite ou une tâche async en file après commit",
      "Mettre HTTP dans __init__",
      "Utiliser des requêtes sync dans le middleware",
    ],
    explanation:
      "Des services domaine explicites ou des tâches on_commit rendent les effets de bord visibles et testables.",
  },
  "ld-sql-01": {
    domainLabel: "SQL / PostgreSQL",
    scenario:
      "EXPLAIN montre un seq scan sur une colonne filtrée avec 2 % de sélectivité ; l'index existe mais le planificateur l'ignore. Statistiques obsolètes après un chargement massif. Première action ?",
    choices: [
      "Supprimer l'index",
      "Exécuter ANALYZE sur la table et revoir les estimations du planificateur",
      "Forcer l'index sur chaque requête en permanence",
      "Augmenter uniquement shared_buffers",
    ],
    explanation:
      "Des stats obsolètes induisent en erreur les estimations de coût ; ANALYZE rafraîchit les infos de distribution.",
  },
  "ld-sql-02": {
    domainLabel: "SQL / PostgreSQL",
    scenario:
      "Une transaction Serializable signale un échec de sérialisation sous réservations concurrentes. Règle métier : pas de double réservation sur le même créneau. Meilleure gestion ?",
    choices: [
      "Réessayer la transaction avec backoff en cas d'échec de sérialisation",
      "Utiliser READ UNCOMMITTED",
      "Supprimer les contraintes",
      "Verrouiller toute la base",
    ],
    explanation:
      "Serializable + retry est valide ; envisager aussi des contraintes d'exclusion explicites et des transactions plus courtes.",
  },
  "ld-sql-03": {
    domainLabel: "SQL / PostgreSQL",
    scenario:
      "Une requête de pagination utilise OFFSET 500000 et devient lente. La pagination par curseur est possible sur created_at,id. Pourquoi le keyset est-il meilleur ici ?",
    choices: [
      "OFFSET ignore logiquement moins de lignes",
      "Le keyset cherche à partir du dernier tuple vu au lieu de scanner les lignes ignorées",
      "Le keyset désactive les index",
      "OFFSET est déprécié dans PostgreSQL",
    ],
    explanation:
      "Un grand OFFSET force le scan des lignes jetées ; le keyset utilise une recherche indexée.",
  },
  "ld-sql-04": {
    domainLabel: "SQL / PostgreSQL",
    scenario:
      "Une migration longue détient AccessExclusiveLock ; les timeouts applicatifs explosent. Atténuation opérationnelle pendant le déploiement ?",
    choices: [
      "Utiliser lock_timeout / statement_timeout et scinder la migration en phases",
      "Mettre synchronous_commit off pour toujours",
      "Lancer la migration en prod depuis un laptop anonymement",
      "Couper les connexions avec pg_terminate_backend pour tous les utilisateurs en permanence",
    ],
    explanation: "Des migrations par phases et des lock timeouts limitent le rayon d'impact.",
  },
  "ld-algo-01": {
    domainLabel: "Algorithmes",
    scenario:
      "Top-K éléments fréquents en flux depuis un firehose avec mémoire bornée. Quelle approche convient ?",
    choices: [
      "Trier tout l'historique sur disque chaque seconde",
      "Heavy hitters approximatifs (count-min sketch / space-saving) avec bornes d'erreur définies",
      "Hash map stockant chaque clé unique pour toujours",
      "Recherche dichotomique sur un flux non trié",
    ],
    explanation: "L'approximation échange l'exactitude contre une mémoire bornée à l'échelle.",
  },
  "ld-algo-02": {
    domainLabel: "Algorithmes",
    scenario:
      "Dijkstra échoue sur des graphes avec arêtes négatives. Vous avez besoin des plus courts chemins avec poids négatifs possibles mais sans cycles négatifs. Correction standard ?",
    choices: [
      "Bellman-Ford ou SPFA avec détection de cycle",
      "Exécuter Dijkstra deux fois",
      "Utiliser BFS uniquement",
      "Multiplier les poids par -1",
    ],
    explanation: "Bellman-Ford gère les arêtes négatives avec vérification de cycle.",
  },
  "ld-algo-03": {
    domainLabel: "Algorithmes",
    scenario:
      "Fusionner k fichiers de logs triés, chacun avec des millions de lignes, en minimisant la mémoire. Meilleur pattern ?",
    choices: [
      "Charger tous les fichiers en RAM et trier une fois",
      "Fusion k-voies avec un min-heap des têtes courantes",
      "Boucles imbriquées fusionnant par paires sans tri",
      "grep aléatoirement jusqu'à la fin",
    ],
    explanation: "La fusion par heap est O(total log k) en temps avec O(k) mémoire.",
  },
  "ld-algo-04": {
    domainLabel: "Algorithmes",
    scenario:
      "Cache avec éviction LRU et TTL par clé. Quel design évite les scans O(n) à l'expiration ?",
    choices: [
      "Expiration paresseuse à l'accès plus nettoyage périodique ou timing wheel par buckets",
      "Scanner toutes les clés à chaque GET",
      "Ne jamais expirer",
      "TTL global unique avec flush complet",
    ],
    explanation: "Expiration paresseuse + buckets amortit le coût du nettoyage.",
  },
  "ld-sd-01": {
    domainLabel: "Conception système",
    scenario:
      "Catalogue produit très lu ; les écritures sont rares. La latence P99 des lectures pic quand le marketing lance une vente flash (lectures seulement). Premier levier de montée en charge ?",
    choices: [
      "Ajouter des réplicas lecture + cache des clés chaudes avec invalidation explicite à l'écriture",
      "Sharder les écritures avant les lectures",
      "Déplacer le catalogue uniquement dans le localStorage client",
      "Désactiver le marketing",
    ],
    explanation:
      "Le chemin lecture scale avec réplicas/cache ; le trafic flash amplifie les lectures.",
  },
  "ld-sd-02": {
    domainLabel: "Conception système",
    scenario:
      "Un webhook de paiement idempotent peut arriver deux fois. Comment garantir un effet métier exactly-once ?",
    choices: [
      "Ignorer silencieusement le second appel HTTP sans stockage",
      "Stocker la clé d'idempotence avec le résultat traité dans un store durable dans une transaction",
      "Utiliser GET pour le webhook",
      "S'appuyer sur un UUID client en mémoire",
    ],
    explanation: "Un enregistrement d'idempotence durable rend les retries sûrs.",
  },
  "ld-sd-03": {
    domainLabel: "Conception système",
    scenario:
      "Un service d'upload accepte des fichiers de 5 Go. Les serveurs API manquent de mémoire. Changement d'architecture ?",
    choices: [
      "Streamer vers l'object storage avec upload multipart signé ; l'API orchestre sans bufferiser tout le fichier",
      "Augmenter la RAM des pods API uniquement",
      "Base64 dans le corps JSON",
      "Stocker les fichiers dans le cookie de session",
    ],
    explanation:
      "Upload multipart direct vers le stockage évite de charger le blob en mémoire applicative.",
  },
  "ld-sd-04": {
    domainLabel: "Conception système",
    scenario:
      "Des utilisateurs mondiaux ont besoin de lectures à faible latence ; les écritures doivent rester fortement cohérentes pour les soldes financiers. Pattern réaliste ?",
    choices: [
      "Région primary unique pour les écritures avec réplicas lecture ailleurs acceptant une staleness bornée pour les lectures non-solde",
      "Active-active writable partout sans coordination",
      "Fusion aléatoire des soldes côté client",
      "Cohérence éventuelle pour les soldes",
    ],
    explanation:
      "La cohérence forte pour l'argent implique en général un chemin writer unique ; staleness sélective ailleurs.",
  },
  "ld-sd-05": {
    domainLabel: "Conception système",
    scenario:
      "Les feature flags doivent se mettre à jour en quelques secondes dans le monde entier sans redéploiement. Design minimal viable ?",
    choices: [
      "Rebuilder le frontend toutes les heures",
      "Service de config poll/subscribe avec payload de flags versionné et TTL de cache client",
      "Hardcoder les flags dans git",
      "Envoyer les flags par e-mail aux utilisateurs",
    ],
    explanation:
      "Config distante versionnée avec TTL/abonnement permet un contrôle de déploiement rapide.",
  },
  "ld-dist-01": {
    domainLabel: "Systèmes distribués",
    scenario:
      "Le microservice A appelle B ; B est lent ; les pools de threads s'épuisent dans A. Amélioration immédiate de résilience ?",
    choices: [
      "Ajouter timeouts, bulkheads et circuit breaker avec fallback ou budget d'erreur",
      "Augmenter les threads sans limite",
      "Retry immédiat synchronisé à l'infini",
      "Fusionner les services en une seule JVM",
    ],
    explanation:
      "Timeouts + isolation empêchent la cascade ; les retries aveugles aggravent la surcharge.",
  },
  "ld-dist-02": {
    domainLabel: "Systèmes distribués",
    scenario:
      "Le lag du consumer Kafka augmente ; le traitement est idempotent mais l'ordre compte par clé de partition. Monter en charge les consumers ?",
    choices: [
      "Augmenter partitions et consumers du même groupe jusqu'au nombre de partitions ; préserver le routage par clé",
      "Lancer des groupes consumers dupliqués sur le même topic sans coordination",
      "Supprimer le topic",
      "Passer à UDP",
    ],
    explanation:
      "Le parallélisme est borné par les partitions ; la clé préserve l'ordre par entité.",
  },
  "ld-dist-03": {
    domainLabel: "Systèmes distribués",
    scenario:
      "Split-brain dans un service élu leader lors d'une partition réseau. Accent sur la prévention ?",
    choices: [
      "Exiger un quorum (majorité) pour le leadership et des fencing tokens pour les writers",
      "Deux leaders conviennent si load balanced",
      "Utiliser uniquement la synchro horloge murale",
      "Désactiver les heartbeats",
    ],
    explanation: "Quorum + fencing évite les double writers.",
  },
  "ld-dist-04": {
    domainLabel: "Systèmes distribués",
    scenario:
      "Les compensations d'une saga échouent en milieu de flux après un succès partiel. Exigence opérationnelle ?",
    choices: [
      "Runbooks manuels uniquement",
      "Persister l'état de la saga, rendre les compensations idempotentes, alerter sur les états bloqués avec outillage de replay",
      "Utiliser toujours le two-phase commit sur tous les microservices",
      "Éviter les pannes",
    ],
    explanation:
      "État d'orchestration durable et compensations idempotentes permettent la reprise.",
  },
  "ld-prod-01": {
    domainLabel: "Production / Débogage",
    scenario:
      "Le déploiement réussit mais le taux d'erreur bondit ; le dernier changement a activé un feature flag ON par défaut. Atténuation sûre la plus rapide ?",
    choices: [
      "Basculer le flag OFF via le service de config et vérifier la reprise des SLO avant un rollback plus profond",
      "Scaler les pods à zéro en permanence",
      "Attendre le week-end",
      "Vider la base de production",
    ],
    explanation:
      "Le kill switch par flag est le plus rapide quand l'architecture le supporte.",
  },
  "ld-prod-02": {
    domainLabel: "Production / Débogage",
    scenario:
      "CPU élevé sur les nœuds API ; les profils montrent un backtracking catastrophique de regex sur l'entrée utilisateur. Priorité de correction ?",
    choices: [
      "Ajouter des limites d'entrée, regex sûre ou moteur type RE2 ; test de régression avec entrée malveillante",
      "Ajouter plus de CPU",
      "Désactiver les logs",
      "Profiler moins",
    ],
    explanation: "ReDoS se corrige par code/validation d'entrée, pas seulement par capacité.",
  },
  "ld-prod-03": {
    domainLabel: "Production / Débogage",
    scenario:
      "Secret fuité dans le bundle client détecté par un scanner. Séquence correcte ?",
    choices: [
      "Rotation du secret, purge de l'historique git si besoin, audit des logs d'accès, redéploiement sans secret côté client",
      "Ignorer si HTTPS",
      "Renommer uniquement le fichier secret",
      "Publier le secret sur la page de statut",
    ],
    explanation:
      "Rotation + retrait côté client + audit : hygiène d'incident standard.",
  },
  "ld-prod-04": {
    domainLabel: "Production / Débogage",
    scenario:
      "Des 500 intermittents corrèlent avec des pauses GC sur un seul nœud. Prochaine étape de diagnostic ?",
    choices: [
      "Comparer métriques heap/GC et limites mémoire du conteneur vs autres nœuds ; chercher fuite mémoire ou heap sous-dimensionné",
      "Redémarrer des pods aléatoires chaque jour sans métriques",
      "Désactiver le GC",
      "Augmenter la verbosité des logs en DEBUG globalement pour toujours",
    ],
    explanation:
      "Un GC spécifique à un nœud suggère une pression mémoire ou une fuite isolée à l'instance.",
  },
  "ld-ai-01": {
    domainLabel: "Ingénierie IA",
    scenario:
      "Un agent LLM appelle des outils avec des URL fournies par l'utilisateur ; un risque SSRF apparaît en revue. Atténuation ?",
    choices: [
      "Liste blanche de domaines, bloquer les IP metadata, sandbox egress, valider les args d'outil côté serveur",
      "Faire confiance au modèle",
      "Exécuter les outils en root",
      "Désactiver HTTPS",
    ],
    explanation: "L'egress des outils doit être contraint comme tout fetch serveur.",
  },
  "ld-ai-02": {
    domainLabel: "Ingénierie IA",
    scenario:
      "Les réponses RAG hallucinent des citations. Amélioration qualité avec observabilité ?",
    choices: [
      "Augmenter la température",
      "Ancrer les réponses avec scores de retrieval, exiger la correspondance des chunks cités, logger des evals de fidélité sur échantillons prod",
      "Supprimer le retrieval",
      "Utiliser uniquement des prompts plus longs",
    ],
    explanation:
      "Ancrage mesuré + boucles d'eval réduisent les citations infidèles.",
  },
  "ld-ai-03": {
    domainLabel: "Ingénierie IA",
    scenario:
      "Injection de prompt via le contenu d'e-mail traité par un agent autonome. Défense en profondeur ?",
    choices: [
      "Séparer le contenu non fiable avec des délimiteurs, couche de policy sur les permissions d'outils, approbation humaine pour les outils destructifs",
      "Concaténer tout le texte comme prompt système",
      "Donner au agent des clés API admin",
      "Ignorer l'injection comme cas limite",
    ],
    explanation:
      "Traiter le texte non fiable comme données ; limiter le rayon d'action des outils.",
  },
  "ld-gis-01": {
    domainLabel: "SIG",
    scenario:
      "La latence du serveur de tuiles carte explose mondialement. Origine en UE ; utilisateurs en APAC. Première étape CDN/architecture ?",
    choices: [
      "Mettre en cache les tuiles au CDN edge avec clés z/x/y et TTL long immutable pour tilesets versionnés",
      "Rendre chaque tuile à chaque pan côté serveur de façon synchrone",
      "Stocker les tuiles uniquement dans sessionStorage",
      "Désactiver le zoom",
    ],
    explanation: "Les tuiles statiques versionnées sont adaptées au CDN.",
  },
  "ld-gis-02": {
    domainLabel: "SIG",
    scenario:
      "Une requête PostGIS trouve les points dans 5 km d'un véhicule en mouvement mis à jour chaque seconde. Besoin de lectures sub-seconde à l'échelle.",
    choices: [
      "ST_DWithin avec type geography et index GiST sur geom ; simplifier la géométrie ; partitionner les régions chaudes",
      "Full table scan chaque seconde",
      "Stocker lat/lon en chaînes",
      "Utiliser haversine en application sur toutes les lignes",
    ],
    explanation:
      "Des prédicats geography indexés évitent les scans distance brute force.",
  },
  "ld-gis-03": {
    domainLabel: "SIG",
    scenario:
      "Le client envoie du GeoJSON avec des polygones invalides auto-intersectants pour upload. Approche de validation serveur ?",
    choices: [
      "Accepter toute géométrie ; corriger uniquement côté frontend",
      "Valider la topologie (ST_IsValid), rejeter ou réparer avec politique explicite, logger les soumissions invalides",
      "Convertir en WKT sans contrôles",
      "Désactiver la validation pour la performance",
    ],
    explanation:
      "Une géométrie invalide casse les opérations spatiales aval ; valider côté serveur.",
  },
  "ld-senior-01": {
    domainLabel: "Ingénierie senior / Communication",
    scenario:
      "L'équipe propose une réécriture ; le système a des bugs critiques pour le revenu mais des fonctionnalités stables. Votre position en revue d'architecture ?",
    choices: [
      "Plaider pour un strangler incrémental avec SLO mesurables et rollback, documenter le risque d'une réécriture big-bang",
      "Approuver la réécriture complète immédiatement",
      "Refuser tout changement",
      "Déléguer la décision à un stagiaire",
    ],
    explanation:
      "La communication senior équilibre risque, continuité métier et migration mesurable.",
  },
  "ld-senior-02": {
    domainLabel: "Ingénierie senior / Communication",
    scenario:
      "Postmortem d'incident : ton accusateur envers l'on-call. Meilleure facilitation ?",
    choices: [
      "Se concentrer sur la timeline, facteurs contributifs et follow-ups actionnables ; séparer les personnes des systèmes",
      "Nommer publiquement les individus fautifs",
      "Sauter le postmortem",
      "Publier les logs de chat bruts à l'extérieur",
    ],
    explanation:
      "Les postmortems sans blame améliorent l'apprentissage et réduisent la peur de signaler.",
  },
  "ld-senior-03": {
    domainLabel: "Ingénierie senior / Communication",
    scenario:
      "Le produit veut une date pour une dépendance multi-équipes ; l'incertitude engineering est élevée. Réponse ?",
    choices: [
      "Engager une date fixe pour satisfaire les ventes",
      "Proposer une fourchette avec hypothèses, jalons et inconnues explicites ; proposer un spike pour réduire l'incertitude",
      "Dire jamais",
      "Ignorer le produit",
    ],
    explanation:
      "Fourchettes transparentes et travail de discovery : attentes de niveau senior.",
  },
};
