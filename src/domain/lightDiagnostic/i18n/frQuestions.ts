import type { LightDiagnosticQuestion } from "../types";

type FrQuestionPack = Pick<LightDiagnosticQuestion, "domainLabel" | "scenario" | "choices" | "explanation">;

export const LIGHT_DIAGNOSTIC_FR: Record<string, FrQuestionPack> = {
  "ld-react-01": {
    domainLabel: "React / TypeScript",
    scenario:
      "Une liste se re-rend à chaque frappe dans une zone de recherche car l'état parent est mis à jour. Les enfants sont des composants purs coûteux mais se re-rendent quand même. Quelle est la correction la plus probable ?",
    choices: [
      "Colocaliser l'état de recherche dans chaque ligne pour que l'arbre parent évite les mises à jour locales",
      "Stabiliser les props enfants avec memo plus useCallback et useMemo pour handlers et données dérivées passées",
      "Throttler le setState parent tout en passant des handlers inline et objets neufs aux enfants mémoïsés",
      "Envelopper la liste dans des providers de contexte supplémentaires pour limiter l'invalidation au sous-arbre",
    ],
    explanation:
      "Des références de props instables annulent memo. Localiser l'état dans chaque enfant casse la source unique de vérité pour la recherche.",
  },
  "ld-react-02": {
    domainLabel: "React / TypeScript",
    scenario:
      "StrictMode invoque les effets deux fois en développement. Un effet fetch au montage crée des abonnements dupliqués en prod après un mauvais merge. Meilleure prévention ?",
    choices: [
      "Garde-fou module pour que la seconde invocation StrictMode sorte avant de s'abonner en développement",
      "Cleanup AbortController pour annuler le travail en cours et rendre l'abonnement idempotent au remontage",
      "Déplacer le fetch vers useLayoutEffect pour qu'il s'exécute une fois avant peinture sans double appel",
      "Stocker l'abonnement dans une ref et ignorer un re-fetch si ref.current est déjà défini après montage",
    ],
    explanation:
      "Le bon pattern est des effets annulables avec cleanup ; StrictMode expose l'absence de cleanup, pas la cause racine.",
  },
  "ld-react-03": {
    domainLabel: "React / TypeScript",
    scenario:
      "TypeScript affine une union discriminée dans un switch, mais un handler partagé élargit le type à l'union. Quelle approche de typage préserve l'exhaustivité ?",
    choices: [
      "Un handler typé sur l'union complète avec des typeof runtime au lieu de cas compile-time distincts",
      "Handler générique par cas ou fonctions séparées par variante pour conserver l'affinement à l'appel",
      "Remplacer l'union par un enum numérique pour que le switch n'exige plus d'exhaustivité sur les variantes",
      "Assert le discriminant avec non-null dans le handler partagé après la branche default du switch",
    ],
    explanation: "Des handlers par variante ou des génériques préservent l'affinement ; les casts effacent la sécurité.",
  },
  "ld-react-04": {
    domainLabel: "React / TypeScript",
    scenario:
      "Fonctionnalités concurrentes : une transition met à jour un grand tableau pendant la saisie d'un filtre. Les utilisateurs voient brièvement des résultats de filtre obsolètes. Compromis attendu et atténuation ?",
    choices: [
      "Mettre à jour tableau et filtre en synchrone dans un seul batch setState pour un snapshot cohérent",
      "Marquer la saisie filtre urgente et différer le tableau lourd avec startTransition et une valeur différée",
      "Mémoïser tout le tableau avec useMemo sur le texte filtre pour que la frappe ne reconcile jamais",
      "Filtrer dans un worker et postMessage à chaque frappe sans prioriser le chemin de mise à jour saisie",
    ],
    explanation:
      "Saisie utilisateur urgente vs rendu coûteux différé : c'est le pattern concurrent prévu.",
  },
  "ld-react-05": {
    domainLabel: "React / TypeScript",
    scenario:
      "Une librairie de formulaire stocke l'état des champs dans des refs pour éviter les re-renders, mais les messages d'erreur ne se mettent jamais à jour. Quel est le problème sous-jacent ?",
    choices: [
      "Lire ref.current au render et l'alimenter dans useMemo pour recalculer l'UI quand les refs mutent",
      "L'UI dérivée des refs doit passer par state ou abonnement store pour que les mutations planifient un render",
      "Appeler flushSync après chaque écriture ref pour afficher les erreurs sans remonter les valeurs en state",
      "Persister les erreurs en sessionStorage et poller périodiquement au lieu de lier les erreurs à React",
    ],
    explanation:
      "Les refs mutent sans planifier de rendu ; les patterns validés exposent un état de champ observable.",
  },
  "ld-django-01": {
    domainLabel: "Python / Django",
    scenario:
      "Une requête ORM dans une boucle provoque 200 requêtes sur une page liste. Le queryset utilise déjà select_related pour la FK. Quelle est la prochaine correction probable ?",
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
      "Deux tâches Celery mettent à jour la même ligne en read-modify-write sans verrou. Des mises à jour perdues sporadiques apparaissent sous charge. Approche la plus sûre côté Django ?",
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
      "Une vue renvoie 403 pour POST mais GET fonctionne. Middleware CSRF activé, cookie de session présent. Client mobile utilise une API avec en-tête JWT. Cause la plus plausible ?",
    choices: [
      "POST session attend CSRF ; le client doit envoyer un token CSRF, une route exemptée ou une auth session alignée",
      "L'app mobile doit envoyer le cookie session sur POST comme sur GET pour que l'authentification corresponde",
      "Enregistrer JWT avant session auth globalement pour que Authorization bypass CSRF sur tout POST",
      "Marquer la vue csrf_exempt dès qu'un bearer token est présent et s'appuyer sur la validation JWT seule",
    ],
    explanation:
      "Un POST avec session attend CSRF ; les chemins d'auth par token diffèrent des formulaires navigateur.",
  },
  "ld-django-04": {
    domainLabel: "Python / Django",
    scenario:
      "Une migration ajoute une colonne non nullable à une table de 50 M lignes. La fenêtre de déploiement est courte. Séquence à plus faible risque ?",
    choices: [
      "Ajouter une colonne nullable, backfill par lots, puis imposer NOT NULL dans une migration ultérieure",
      "Ajouter la colonne non-null avec default serveur en une migration en pleine charge pour finir plus vite",
      "Recréer la table vide avec le nouveau schéma et copier les lignes en une fenêtre de maintenance unique",
      "Migration RunPython longue qui verrouille la table jusqu'à mise à jour de chaque ligne en une transaction",
    ],
    explanation:
      "Expand-backfill-contract évite les verrous longs et les réécritures de table lorsque c'est possible.",
  },
  "ld-django-05": {
    domainLabel: "Python / Django",
    scenario:
      "Les signals se déclenchent à chaque save et lancent des appels HTTP externes, ralentissant les écritures. Refactorisation préférée ?",
    choices: [
      "Désenregistrer tous les receivers au démarrage et appeler les mêmes HTTP depuis save() du modèle",
      "Déplacer les effets vers une couche service explicite ou une tâche async on_commit après la transaction",
      "Garder les signals mais exécuter les requêtes sync dans pre_save pour rollback avant persistance",
      "Appeler l'API externe depuis le middleware à chaque réponse pour garder les writes rapides globalement",
    ],
    explanation:
      "Des services domaine explicites ou des tâches on_commit rendent les effets de bord visibles et testables.",
  },
  "ld-sql-01": {
    domainLabel: "SQL / PostgreSQL",
    scenario:
      "EXPLAIN montre un seq scan sur une colonne filtrée avec 2 % de sélectivité ; l'index existe mais le planificateur l'ignore. Statistiques obsolètes après un chargement massif. Première action ?",
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
      "Une transaction Serializable signale un échec de sérialisation sous réservations concurrentes. Règle métier : pas de double réservation sur le même créneau. Meilleure gestion ?",
    choices: [
      "Réessayer la transaction avec backoff borné en cas d'échec de sérialisation et garder des transactions courtes",
      "Baisser l'isolation en read committed et s'appuyer sur des checks applicatifs sans détection DB",
      "Retirer contraintes uniques ou d'exclusion pour que les écritures concurrentes ne signalent plus d'échec",
      "Verrou exclusif sur toute la table bookings à chaque insert pour sérialiser tous les writers globalement",
    ],
    explanation:
      "Serializable + retry est valide ; envisager aussi des contraintes d'exclusion explicites et des transactions plus courtes.",
  },
  "ld-sql-03": {
    domainLabel: "SQL / PostgreSQL",
    scenario:
      "Une requête de pagination utilise OFFSET 500000 et devient lente. La pagination par curseur est possible sur created_at,id. Pourquoi le keyset est-il meilleur ici ?",
    choices: [
      "OFFSET lit quand même chaque ligne ignorée mais évite le tri si la table a une clé primaire sur id seul",
      "Le keyset cherche depuis le dernier tuple vu via l'index au lieu de scanner et jeter les lignes offset",
      "Le keyset force un seq scan car la colonne curseur ne peut pas utiliser un index composite efficacement",
      "OFFSET est lent seulement si autovacuum est en retard ; keyset corrige les stats plutôt que le coût scan",
    ],
    explanation:
      "Un grand OFFSET force le scan des lignes jetées ; le keyset utilise une recherche indexée.",
  },
  "ld-sql-04": {
    domainLabel: "SQL / PostgreSQL",
    scenario:
      "Une migration longue détient AccessExclusiveLock ; les timeouts applicatifs explosent. Atténuation opérationnelle pendant le déploiement ?",
    choices: [
      "Définir lock_timeout et statement_timeout et scinder la migration en phases courtes avec rollback sûr",
      "Désactiver synchronous_commit cluster-wide en permanence pour libérer plus vite les verrous DDL",
      "Lancer la migration depuis une session ad hoc sans timeouts pour qu'elle se termine toujours en un passage",
      "Couper toutes les connexions applicatives à chaque déploiement pour que les migrations n'attendent jamais",
    ],
    explanation: "Des migrations par phases et des lock timeouts limitent le rayon d'impact.",
  },
  "ld-algo-01": {
    domainLabel: "Algorithmes",
    scenario:
      "Top-K éléments fréquents en flux depuis un firehose avec mémoire bornée. Quelle approche convient ?",
    choices: [
      "Spiller tout le flux sur disque chaque fenêtre et trier entièrement pour extraire exactement le top K",
      "Heavy hitters approximatifs type count-min sketch ou space-saving avec bornes d'erreur explicites",
      "Hash map de chaque clé distincte depuis le démarrage et purge seulement quand la mémoire est saturée",
      "Tableau trié de toutes les clés vues et recherche dichotomique à chaque événement entrant pour le rang",
    ],
    explanation: "L'approximation échange l'exactitude contre une mémoire bornée à l'échelle.",
  },
  "ld-algo-02": {
    domainLabel: "Algorithmes",
    scenario:
      "Dijkstra échoue sur des graphes avec arêtes négatives. Vous avez besoin des plus courts chemins avec poids négatifs possibles mais sans cycles négatifs. Correction standard ?",
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
      "Fusionner k fichiers de logs triés, chacun avec des millions de lignes, en minimisant la mémoire. Meilleur pattern ?",
    choices: [
      "Charger chaque fichier en mémoire, concaténer et trier une fois toutes les lignes en RAM",
      "Fusion k-voies avec min-heap contenant la tête courante de chaque flux de fichier ouvert",
      "Fusion par paires en boucles imbriquées sans préserver l'ordre trié jusqu'à un fichier final unique",
      "Échantillonner des lignes aléatoires par fichier jusqu'à couverture puis trier l'échantillon collecté",
    ],
    explanation: "La fusion par heap est O(total log k) en temps avec O(k) mémoire.",
  },
  "ld-algo-04": {
    domainLabel: "Algorithmes",
    scenario:
      "Cache avec éviction LRU et TTL par clé. Quel design évite les scans O(n) à l'expiration ?",
    choices: [
      "Expiration paresseuse à l'accès plus nettoyage périodique par buckets ou timing wheel pour TTL dus",
      "Scanner l'ensemble des clés à chaque lecture pour supprimer les expirées avant hit ou miss",
      "Désactiver TTL par clé et vider tout le cache sur un intervalle global unique pour simplifier",
      "Stocker les échéances dans une map annexe et parcourir toutes les entrées à chaque écriture synchrone",
    ],
    explanation: "Expiration paresseuse + buckets amortit le coût du nettoyage.",
  },
  "ld-sd-01": {
    domainLabel: "Conception système",
    scenario:
      "Catalogue produit très lu ; les écritures sont rares. La latence P99 des lectures pic quand le marketing lance une vente flash (lectures seulement). Premier levier de montée en charge ?",
    choices: [
      "Réplicas lecture et cache des clés catalogue chaudes avec invalidation explicite à chaque changement produit",
      "Sharder d'abord le chemin d'écriture pour que chaque partition serve les lectures localement sans cache partagé",
      "Servir tout le catalogue depuis localStorage navigateur et éviter les lectures serveur pendant la vente",
      "Limiter le trafic marketing au CDN edge seulement en gardant les lectures origine non mises en cache",
    ],
    explanation:
      "Le chemin lecture scale avec réplicas/cache ; le trafic flash amplifie les lectures.",
  },
  "ld-sd-02": {
    domainLabel: "Conception système",
    scenario:
      "Un webhook de paiement idempotent peut arriver deux fois. Comment garantir un effet métier exactly-once ?",
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
      "Un service d'upload accepte des fichiers de 5 Go. Les serveurs API manquent de mémoire. Changement d'architecture ?",
    choices: [
      "Streamer vers object storage via upload multipart signé pendant que l'API orchestre les parts seulement",
      "Scaler verticalement la RAM des pods API pour bufferiser un objet 5 Go entier pendant la requête",
      "Accepter le fichier en base64 dans JSON pour que les clients découpent sans changer le design serveur",
      "Stocker les octets d'upload dans des cookies session signés et assembler l'objet à la dernière requête chunk",
    ],
    explanation:
      "Upload multipart direct vers le stockage évite de charger le blob en mémoire applicative.",
  },
  "ld-sd-04": {
    domainLabel: "Conception système",
    scenario:
      "Des utilisateurs mondiaux ont besoin de lectures à faible latence ; les écritures doivent rester fortement cohérentes pour les soldes financiers. Pattern réaliste ?",
    choices: [
      "Primary d'écriture unique avec réplicas lecture régionaux et staleness bornée seulement hors soldes",
      "Réplicas actifs-actifs inscriptibles partout sans coordination inter-régions sur les mises à jour soldes",
      "Fusionner côté client en prenant le max des soldes rapportés par deux endpoints régionaux aléatoires",
      "Cohérence éventuelle sur les lignes solde et rapprochement des écarts dans un batch nocturne seulement",
    ],
    explanation:
      "La cohérence forte pour l'argent implique en général un chemin writer unique ; staleness sélective ailleurs.",
  },
  "ld-sd-05": {
    domainLabel: "Conception système",
    scenario:
      "Les feature flags doivent se mettre à jour en quelques secondes dans le monde entier sans redéploiement. Design minimal viable ?",
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
      "Le microservice A appelle B ; B est lent ; les pools de threads s'épuisent dans A. Amélioration immédiate de résilience ?",
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
      "Le lag du consumer Kafka augmente ; le traitement est idempotent mais l'ordre compte par clé de partition. Monter en charge les consumers ?",
    choices: [
      "Augmenter partitions du topic et membres du consumer group jusqu'au nombre de partitions en gardant le routage clé",
      "Lancer un second consumer group sur le même topic sans coordination pour doubler le débit par clé",
      "Supprimer et recréer le topic avec moins de partitions pour que chaque consumer traite plus de clés par poll",
      "Remplacer Kafka par un fanout UDP pour que les consumers reçoivent plus vite sans backpressure broker",
    ],
    explanation:
      "Le parallélisme est borné par les partitions ; la clé préserve l'ordre par entité.",
  },
  "ld-dist-03": {
    domainLabel: "Systèmes distribués",
    scenario:
      "Split-brain dans un service élu leader lors d'une partition réseau. Accent sur la prévention ?",
    choices: [
      "Exiger quorum majorité pour le leadership et fencing tokens avant que les writers mutent l'état partagé",
      "Autoriser deux leaders actifs pendant partition si un load balancer répartit le trafic entre eux",
      "S'appuyer sur horloges murales synchronisées entre nœuds pour décider quel leader est valide après guérison",
      "Désactiver temporairement les timeouts heartbeat pour que les leaders élus ne abdiquent pas lors de blips réseau",
    ],
    explanation: "Quorum + fencing évite les double writers.",
  },
  "ld-dist-04": {
    domainLabel: "Systèmes distribués",
    scenario:
      "Les compensations d'une saga échouent en milieu de flux après un succès partiel. Exigence opérationnelle ?",
    choices: [
      "Runbooks manuels seulement et exiger que les ops réparent les flux bloqués sans état saga persisté",
      "Persister l'état saga, rendre compensations idempotentes, alerter sur étapes bloquées avec replay sûr",
      "Imposer two-phase commit sur chaque microservice participant pour tous les flux métier longs",
      "Concevoir les sagas pour que les compensations n'échouent jamais en ignorant rollback si erreur aval",
    ],
    explanation:
      "État d'orchestration durable et compensations idempotentes permettent la reprise.",
  },
  "ld-prod-01": {
    domainLabel: "Production / Débogage",
    scenario:
      "Le déploiement réussit mais le taux d'erreur bondit ; le dernier changement a activé un feature flag ON par défaut. Atténuation sûre la plus rapide ?",
    choices: [
      "Couper le flag dans le service de config et confirmer reprise SLO avant rollback de déploiement complet",
      "Scaler les pods API à zéro jusqu'à baisse du taux d'erreur puis redéployer l'image précédente sans flag",
      "Attendre le creux de trafic avant investigation pour que le bruit incident n'affecte pas les sessions jour",
      "Tronquer les tables prod liées et rejouer migrations pour repartir du nouveau chemin code à plat",
    ],
    explanation:
      "Le kill switch par flag est le plus rapide quand l'architecture le supporte.",
  },
  "ld-prod-02": {
    domainLabel: "Production / Débogage",
    scenario:
      "CPU élevé sur les nœuds API ; les profils montrent un backtracking catastrophique de regex sur l'entrée utilisateur. Priorité de correction ?",
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
      "Secret fuité dans le bundle client détecté par un scanner. Séquence correcte ?",
    choices: [
      "Rotation secret, retrait des builds client, audit logs d'accès, purge historique git si nécessaire",
      "Laisser le secret car HTTPS chiffre le bundle en transit donc le risque d'exposition reste faible",
      "Renommer la variable d'environnement dans le repo sans rotation pour que les scanners ne matchent plus",
      "Publier une note status avec l'ancien secret pour que les utilisateurs l'ignorent après prochain déploiement",
    ],
    explanation:
      "Rotation + retrait côté client + audit : hygiène d'incident standard.",
  },
  "ld-prod-04": {
    domainLabel: "Production / Débogage",
    scenario:
      "Des 500 intermittents corrèlent avec des pauses GC sur un seul nœud. Prochaine étape de diagnostic ?",
    choices: [
      "Comparer métriques heap/GC et limites mémoire conteneur sur ce nœud vs pairs sains pour fuites ou sous-dimension",
      "Redémarrer pods quotidiennement sans métriques pour que les pauses disparaissent temporairement",
      "Désactiver le GC sur le nœud affecté pour que l'allocation ne déclenche plus de longues pauses",
      "Activer logs DEBUG globaux en permanence pour corréler pauses GC avec traces verbeuses dans les logs",
    ],
    explanation:
      "Un GC spécifique à un nœud suggère une pression mémoire ou une fuite isolée à l'instance.",
  },
  "ld-ai-01": {
    domainLabel: "Ingénierie IA",
    scenario:
      "Un agent LLM appelle des outils avec des URL fournies par l'utilisateur ; un risque SSRF apparaît en revue. Atténuation ?",
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
      "Les réponses RAG hallucinent des citations. Amélioration qualité avec observabilité ?",
    choices: [
      "Augmenter température d'échantillonnage pour explorer formulations et citer chunks retrieval variés",
      "Ancrer réponses avec scores retrieval, exiger correspondance chunks cités, logger evals fidélité sur échantillons",
      "Retirer retrieval et s'appuyer sur connaissance paramétrique pour éviter citations incohérentes",
      "Allonger prompt système avec règles citation seulement sans mesurer qualité correspondance en prod",
    ],
    explanation:
      "Ancrage mesuré + boucles d'eval réduisent les citations infidèles.",
  },
  "ld-ai-03": {
    domainLabel: "Ingénierie IA",
    scenario:
      "Injection de prompt via le contenu d'e-mail traité par un agent autonome. Défense en profondeur ?",
    choices: [
      "Isoler contenu non fiable avec délimiteurs, politiques permissions outils, et garde-fous outils destructifs",
      "Fusionner tout le texte e-mail dans le prompt système pour instructions et contenu dans un bloc unique",
      "Donner clés API admin larges à l'agent pour terminer tâches sans approbations humaines répétées",
      "Traiter injection comme bruit rare et compter sur refus du modèle de base pour ignorer ordres embarqués",
    ],
    explanation:
      "Traiter le texte non fiable comme données ; limiter le rayon d'action des outils.",
  },
  "ld-gis-01": {
    domainLabel: "SIG",
    scenario:
      "La latence du serveur de tuiles carte explose mondialement. Origine en UE ; utilisateurs en APAC. Première étape CDN/architecture ?",
    choices: [
      "Cache tuiles versionnées au CDN edge avec clés z/x/y et TTL long immutable par release tileset",
      "Rendre chaque pan/zoom synchroniquement à l'origine pour chaque utilisateur afin de tuiles toujours fraîches",
      "Stocker pyramide tuiles active en sessionStorage navigateur seulement et éviter fetch réseau après premier load",
      "Désactiver zoom côté client pour que les utilisateurs demandent moins de tuiles distinctes en navigation",
    ],
    explanation: "Les tuiles statiques versionnées sont adaptées au CDN.",
  },
  "ld-gis-02": {
    domainLabel: "SIG",
    scenario:
      "Une requête PostGIS trouve les points dans 5 km d'un véhicule en mouvement mis à jour chaque seconde. Besoin de lectures sub-seconde à l'échelle.",
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
      "Le client envoie du GeoJSON avec des polygones invalides auto-intersectants pour upload. Approche de validation serveur ?",
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
      "L'équipe propose une réécriture ; le système a des bugs critiques pour le revenu mais des fonctionnalités stables. Votre position en revue d'architecture ?",
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
      "Postmortem d'incident : ton accusateur envers l'on-call. Meilleure facilitation ?",
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
      "Le produit veut une date pour une dépendance multi-équipes ; l'incertitude engineering est élevée. Réponse ?",
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
