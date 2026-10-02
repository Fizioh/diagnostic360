import type { LightDiagnosticQuestion } from "../types";

type FrQuestionPack = Pick<LightDiagnosticQuestion, "domainLabel" | "scenario" | "choices" | "explanation"> & {
  codeExample?: LightDiagnosticQuestion["codeExample"];
};

export const LIGHT_DIAGNOSTIC_FR: Record<string, FrQuestionPack> = {
  "ld-react-01": {
    domainLabel: "React / TypeScript",
    scenario:
      "Pourquoi les MemoRow mémoïsés se re-rendent à chaque frappe dans la recherche ?",
    choices: [
      "Colocaliser l'état de recherche dans chaque ligne pour que l'arbre parent évite les mises à jour locales",
      "Stabiliser les props avec memo plus useCallback et useMemo pour handlers et valeurs dérivées passées",
      "Throttler le setState parent tout en passant des handlers inline et objets neufs aux enfants mémoïsés",
      "Envelopper la liste dans des providers de contexte supplémentaires pour limiter l'invalidation au sous-arbre",
    ],
    explanation:
      "Des références de props instables annulent memo. Localiser l'état dans chaque enfant casse la source unique de vérité pour la recherche.",
  },
  "ld-react-02": {
    domainLabel: "React / TypeScript",
    scenario:
      "Après StrictMode en dev, la prod montre des abonnements websocket dupliqués — qu'est-ce qui manque ?",
    choices: [
      "Garde-fou module pour que la seconde invocation StrictMode sorte avant de s'abonner en développement",
      "Cleanup AbortController pour annuler le travail en cours et rendre l'abonnement idempotent au remontage",
      "Déplacer l'abonnement vers useLayoutEffect pour qu'il s'exécute une fois avant peinture sans double appel",
      "Stocker l'abonnement dans une ref et ignorer une reconnexion si ref.current est déjà défini après montage",
    ],
    explanation:
      "Le bon pattern est des effets annulables avec cleanup ; StrictMode expose l'absence de cleanup, pas la cause racine.",
  },
  "ld-react-03": {
    domainLabel: "React / TypeScript",
    scenario:
      "TypeScript signale que action.item peut être undefined dans handle — comment préserver l'exhaustivité ?",
    choices: [
      "Un handler typé sur l'union complète avec des typeof runtime au lieu de cas compile-time distincts",
      "Handler générique par cas ou fonctions séparées par variante pour conserver l'affinement à l'appel",
      "Remplacer l'union par un enum numérique pour que le switch n'exige plus d'exhaustivité sur les variantes",
      "Assert le discriminant avec non-null dans le handler partagé après la branche default du switch",
    ],
    explanation: "Des handlers par variante ou des génériques préservent l'affinement ; les casts effacent la sécurité.",
  },
  "ld-django-01": {
    domainLabel: "Python / Django",
    scenario:
      "Cette vue liste déclenche des centaines de requêtes SQL — quelle correction ORM après select_related ?",
    choices: [
      "Activer le cache queryset sur la vue pour que la boucle réutilise le cache ORM en mémoire du processus",
      "Ajouter prefetch_related pour les collections M2M ou FK inversées touchées à chaque itération de boucle",
      "Réécrire la boucle en une requête SQL brute avec jointures explicites pour chaque relation par ligne",
      "Augmenter la taille du pool de connexions DB pour que les requêtes par ligne ne file d'attente pas",
    ],
    explanation: "select_related couvre les jointures FK ; les relations inverses nécessitent prefetch_related.",
  },
  "ld-django-02": {
    domainLabel: "Python / Django",
    scenario:
      "Des tâches Celery concurrentes perdent des mises à jour stock — quelle correction Django la plus sûre ?",
    choices: [
      "Utiliser select_for_update dans transaction.atomic autour de la section critique read-modify-write",
      "Exécuter chaque tâche en autocommit pour committer plus vite et réduire le chevauchement sur la ligne",
      "Dupliquer les compteurs dans Redis avec GET/SET et ne plus lire la ligne autoritaire pendant les updates",
      "Limiter cette file à un seul worker Celery pour que la section critique ne s'exécute jamais en parallèle",
    ],
    explanation: "Un verrou au niveau ligne dans un bloc atomic sérialise les mises à jour conflictuelles.",
  },
  "ld-django-03": {
    domainLabel: "Python / Django",
    scenario:
      "GET réussit mais POST authentifié par session renvoie 403 avec le middleware CSRF — pourquoi ?",
    choices: [
      "POST session attend CSRF ; le client doit envoyer un token CSRF, une route exemptée ou une auth session alignée",
      "L'app mobile doit envoyer le cookie session sur POST comme sur GET pour que l'authentification corresponde",
      "Enregistrer JWT avant session auth globalement pour que Authorization bypass CSRF sur tout POST",
      "Marquer la vue csrf_exempt dès qu'un bearer token est présent et s'appuyer sur la validation JWT seule",
    ],
    explanation:
      "Un POST avec session attend CSRF ; les chemins d'auth par token diffèrent des formulaires navigateur.",
  },
  "ld-sql-01": {
    domainLabel: "SQL / PostgreSQL",
    scenario:
      "Le planificateur choisit un seq scan malgré un index utilisable après un chargement massif — première action ?",
    choices: [
      "Reconstruire l'index en concurrent pour que le planificateur le considère frais sans toucher aux stats table",
      "Exécuter ANALYZE sur la table et revoir si les estimations de coût reflètent la distribution actuelle",
      "Désactiver enable_seqscan globalement pour forcer l'usage de l'index btree existant sur cette table",
      "Augmenter shared_buffers et work_mem pour que les seq scans deviennent moins chers que les index",
    ],
    explanation:
      "Des stats obsolètes induisent en erreur les estimations de coût ; ANALYZE rafraîchit les infos de distribution.",
  },
  "ld-sql-02": {
    domainLabel: "SQL / PostgreSQL",
    scenario:
      "Des réservations concurrentes sur le même créneau échouent en sérialisation — meilleure gestion ?",
    choices: [
      "Réessayer la transaction avec backoff borné en cas d'échec de sérialisation et garder des transactions courtes",
      "Baisser l'isolation en read committed et s'appuyer sur des checks applicatifs sans détection DB",
      "Retirer contraintes uniques ou d'exclusion pour que les écritures concurrentes ne signalent plus d'échec",
      "Verrou exclusif sur toute la table bookings à chaque insert pour sérialiser tous les writers globalement",
    ],
    explanation:
      "Serializable + retry est valide ; envisager aussi des contraintes d'exclusion explicites et des transactions plus courtes.",
  },
  "ld-algo-02": {
    domainLabel: "Algorithmes",
    scenario:
      "Cette routine de plus court chemin est fausse avec des poids négatifs — correction standard ?",
    choices: [
      "Exécuter Bellman-Ford ou SPFA avec détection de cycle négatif au lieu de Dijkstra sur le même graphe",
      "Lancer Dijkstra deux fois depuis des sources différentes et combiner les distances pour absorber le négatif",
      "Utiliser BFS sur une réduction non pondérée du graphe puis remapper vers les poids d'arêtes originaux",
      "Inverser le signe de tous les poids et lancer Dijkstra une fois puis négater les distances en fin de run",
    ],
    explanation: "Bellman-Ford gère les arêtes négatives avec vérification de cycle.",
  },
  "ld-algo-03": {
    domainLabel: "Algorithmes",
    scenario:
      "Quelle propriété rend ce pattern adapté à fusionner k gros fichiers de logs triés avec peu de mémoire ?",
    choices: [
      "Charger chaque fichier en mémoire, concaténer et trier une fois toutes les lignes en RAM",
      "Fusion k-voies avec min-heap contenant la tête courante de chaque flux de fichier ouvert",
      "Fusion par paires en boucles imbriquées sans préserver l'ordre trié jusqu'à un fichier final unique",
      "Échantillonner des lignes aléatoires par fichier jusqu'à couverture puis trier l'échantillon collecté",
    ],
    explanation: "La fusion par heap est O(total log k) en temps avec O(k) mémoire.",
  },
  "ld-sd-02": {
    domainLabel: "Conception système",
    scenario:
      "Des livraisons webhook dupliquées peuvent créditer deux fois — comment garantir un effet exactly-once ?",
    choices: [
      "Renvoyer HTTP 200 sur doublon sans rien enregistrer pour que le provider arrête vite les retries",
      "Stocker la clé d'idempotence avec le résultat traité en stockage durable dans la même transaction",
      "Passer le webhook en GET avec l'id paiement en query pour que les retries soient naturellement sûrs",
      "Garder le dernier UUID client en mémoire processus et rejeter les doublons jusqu'au redémarrage du pod",
    ],
    explanation: "Un enregistrement d'idempotence durable rend les retries sûrs.",
  },
  "ld-sd-03": {
    domainLabel: "Conception système",
    scenario:
      "Les pods API OOM sur des uploads 5 Go — quel changement d'architecture corrige ce handler ?",
    choices: [
      "Streamer vers object storage via upload multipart signé pendant que l'API orchestre les parts seulement",
      "Scaler verticalement la RAM des pods API pour bufferiser un objet 5 Go entier pendant la requête",
      "Accepter le fichier en base64 dans JSON pour que les clients découpent sans changer le design serveur",
      "Stocker les octets d'upload dans des cookies session signés et assembler l'objet à la dernière requête chunk",
    ],
    explanation:
      "Upload multipart direct vers le stockage évite de charger le blob en mémoire applicative.",
  },
  "ld-sd-05": {
    domainLabel: "Conception système",
    scenario:
      "Les flags doivent basculer mondialement en quelques secondes sans redéploiement — design minimal ?",
    choices: [
      "Rebuilder et redéployer le frontend toutes les heures pour propager les defaults de flags prévisiblement",
      "Service de config versionné avec poll ou push et TTL de cache client court pour les payloads de flags",
      "Commiter les valeurs de flags dans git et attendre le prochain train de release pour propagation globale",
      "Envoyer par e-mail les payloads de flags aux power users et leur demander de rafraîchir le navigateur",
    ],
    explanation:
      "Config distante versionnée avec TTL/abonnement permet un contrôle de déploiement rapide.",
  },
  "ld-dist-01": {
    domainLabel: "Systèmes distribués",
    scenario:
      "Les pools de threads du service A s'épuisent quand B ralentit — quelle stratégie de config en premier ?",
    choices: [
      "Timeouts client, bulkheads et circuit breaker avec retries bornés ou chemin de repli défini",
      "Augmenter la taille max du pool threads sans limite pour que les appels lents file d'attente au lieu d'échouer",
      "Retry synchrone en boucle serrée de chaque appel B jusqu'à réponse ou déconnexion utilisateur",
      "Fusionner A et B en une unité déployable pour que les lenteurs deviennent des attentes in-process",
    ],
    explanation:
      "Timeouts + isolation empêchent la cascade ; les retries aveugles aggravent la surcharge.",
  },
  "ld-dist-02": {
    domainLabel: "Systèmes distribués",
    scenario:
      "Le lag consumer grandit mais l'ordre par orderId doit être préservé — comment monter en charge sans risque ?",
    choices: [
      "Augmenter partitions du topic et membres du consumer group jusqu'au nombre de partitions en gardant le routage clé",
      "Lancer un second consumer group sur le même topic sans coordination pour doubler le débit par clé",
      "Supprimer et recréer le topic avec moins de partitions pour que chaque consumer traite plus de clés par poll",
      "Remplacer Kafka par un fanout UDP pour que les consumers reçoivent plus vite sans backpressure broker",
    ],
    explanation:
      "Le parallélisme est borné par les partitions ; la clé préserve l'ordre par entité.",
  },
  "ld-prod-02": {
    domainLabel: "Production / Débogage",
    scenario:
      "Le CPU explose sur l'entrée utilisateur et les profils montrent un backtracking regex — priorité de fix ?",
    choices: [
      "Limiter taille entrée, regex sûre ou moteur type RE2, plus test régression avec entrée pathologique",
      "Ajouter capacité CPU sur tous les nœuds API pour que le backtracking finisse avant timeout requête",
      "Désactiver temporairement logs requête pour que le regex soit le seul consommateur CPU visible au profil",
      "Échantillonner moins souvent les profils pour réduire overhead prod et lisser les métriques CPU moyennes",
    ],
    explanation: "ReDoS se corrige par code/validation d'entrée, pas seulement par capacité.",
  },
  "ld-prod-03": {
    domainLabel: "Production / Débogage",
    scenario:
      "Un scanner trouve le secret Stripe dans le bundle client — séquence d'incident correcte ?",
    choices: [
      "Rotation secret, retrait des builds client, audit logs d'accès, purge historique git si nécessaire",
      "Laisser le secret car HTTPS chiffre le bundle en transit donc le risque d'exposition reste faible",
      "Renommer la variable d'environnement dans le repo sans rotation pour que les scanners ne matchent plus",
      "Publier une note status avec l'ancien secret pour que les utilisateurs l'ignorent après prochain déploiement",
    ],
    explanation:
      "Rotation + retrait côté client + audit : hygiène d'incident standard.",
  },
  "ld-ai-01": {
    domainLabel: "Ingénierie IA",
    scenario:
      "Des URL fournies par l'utilisateur dans cet outil créent un risque SSRF — quelle atténuation ?",
    choices: [
      "Liste blanche domaines sortants, bloquer IP metadata, sandbox egress, valider args outil côté serveur",
      "Faire confiance au modèle pour refuser URLs internes car le prompt système décrit déjà cibles acceptables",
      "Exécuter handlers outil en root sur l'hôte pour que le noyau bloque connexions réseau privées",
      "Désactiver vérification TLS sur fetch outil pour que redirects internes échouent vite avec erreurs claires",
    ],
    explanation: "L'egress des outils doit être contraint comme tout fetch serveur.",
  },
  "ld-ai-02": {
    domainLabel: "Ingénierie IA",
    scenario:
      "Les réponses RAG citent des sources qui ne correspondent pas aux chunks récupérés — meilleure amélioration ?",
    choices: [
      "Augmenter température d'échantillonnage pour explorer formulations et citer chunks retrieval variés",
      "Ancrer réponses avec scores retrieval, exiger correspondance chunks cités, logger evals fidélité sur échantillons",
      "Retirer retrieval et s'appuyer sur connaissance paramétrique pour éviter citations incohérentes",
      "Allonger prompt système avec règles citation seulement sans mesurer qualité correspondance en prod",
    ],
    explanation:
      "Ancrage mesuré + boucles d'eval réduisent les citations infidèles.",
  },
  "ld-gis-02": {
    domainLabel: "SIG",
    scenario:
      "Cette requête doit rester sub-seconde à l'échelle — quel changement base de données aide le plus ?",
    choices: [
      "ST_DWithin sur geography avec index GiST, simplifier géométries, partitionner régions spatiales chaudes",
      "Scanner toute la table points chaque seconde et filtrer distances en SQL sans index spatial sur geometry",
      "Persister latitude/longitude en chaînes non parsées et les parser en couche app à chaque comparaison",
      "Calculer haversine en code applicatif sur toutes lignes chargées en mémoire à chaque tick véhicule",
    ],
    explanation:
      "Des prédicats geography indexés évitent les scans distance brute force.",
  },
  "ld-gis-03": {
    domainLabel: "SIG",
    scenario:
      "Des polygones GeoJSON auto-intersectants cassent les opérations spatiales aval — approche serveur ?",
    choices: [
      "Accepter toute géométrie et compter sur la lib carte frontend pour réparer topologie avant soumission",
      "Valider topologie avec ST_IsValid, rejeter ou réparer sous politique explicite, logger soumissions invalides",
      "Convertir GeoJSON en WKT à l'ingestion sans contrôles pour normalisation aval par services downstream",
      "Ignorer validation serveur et compter sur checks client pour garder latence upload constamment basse",
    ],
    explanation:
      "Une géométrie invalide casse les opérations spatiales aval ; valider côté serveur.",
  },
  "ld-senior-01": {
    domainLabel: "Ingénierie senior / Communication",
    scenario:
      "Cet ADR de réécriture ignore le risque revenu en cours — quelle position en revue d'architecture ?",
    choices: [
      "Plaider strangler incrémental avec SLO mesurables, rollback, et risque documenté d'une réécriture big-bang",
      "Approuver calendrier réécriture complète immédiate pour corriger structure en une poussée coordonnée",
      "Bloquer tout changement structurel jusqu'à zéro bug revenu, y compris travail d'extraction incrémentale",
      "Reporter la décision architecture à l'ingénieur le plus junior pour que l'équipe pratique l'ownership",
    ],
    explanation:
      "La communication senior équilibre risque, continuité métier et migration mesurable.",
  },
  "ld-senior-02": {
    domainLabel: "Ingénierie senior / Communication",
    scenario:
      "Le brouillon de postmortem accuse l'ingénieur on-call — meilleure facilitation ?",
    choices: [
      "Orienter vers timeline, facteurs contributifs et follow-ups actionnables en séparant personnes et systèmes",
      "Nommer les responsables en réunion pour clarifier accountability avant publication du document",
      "Annuler le postmortem si le ton devient accusateur et reprendre seulement après choix d'un bouc émissaire",
      "Publier transcripts chat bruts à l'extérieur pour que la communauté juge qui a causé la panne",
    ],
    explanation:
      "Les postmortems sans blame améliorent l'apprentissage et réduisent la peur de signaler.",
  },
  "ld-senior-03": {
    domainLabel: "Ingénierie senior / Communication",
    scenario:
      "Le produit veut une date pour une dépendance multi-équipes avec forte incertitude — comment répondre ?",
    choices: [
      "Engager date fixe pour débloquer ventes même si la confiance engineering dans l'estimation est faible",
      "Proposer fourchette avec hypothèses, jalons, inconnues explicites, et spike pour réduire incertitude",
      "Refuser toute discussion de dates jusqu'à résolution de chaque inconnue pour que produit ne planifie pas",
      "Ne plus assister aux sessions planning produit tant que stakeholders n'acceptent pas l'impossibilité d'estimer",
    ],
    explanation:
      "Fourchettes transparentes et travail de discovery : attentes de niveau senior.",
  },
};
