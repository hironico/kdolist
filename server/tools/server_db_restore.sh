#!/usr/bin/env bash
# ------------------------------------------------------------
# – Restaure une base PostgreSQL à partir d’un dump
# ------------------------------------------------------------


# ---- 0. Évaluer les arguments --------------------------------
env_file="$(dirname "$0")/.env"  # fichier par défaut
bck_file=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --env)
            if [[ -n "$2" && "$2" != --* ]]; then
                env_file="$2"
                shift 2
            else
                echo "Erreur : l'option --env nécessite un argument (chemin vers le fichier .env)" >&2
                exit 1
            fi
            ;;
        --file)
            if [[ -n "$2" && "$2" != --* ]]; then
                bck_file="$2"
                shift 2
            else
                echo "Erreur : l'option --file nécessite un argument (chemin vers le fichier de backup)" >&2
                exit 2
            fi
            ;;
        *)
            echo "Option inconnue : $1" >&2
            echo "Usage : $0 [--env fichier_env] --file fichier_backup" >&2
            exit 3
            ;;
    esac
done

# Vérifier que le fichier d'environnement existe
if [[ ! -f "$env_file" ]]; then
    echo "Erreur : le fichier d'environnement '$env_file' n'existe pas" >&2
    exit 1
fi

# Vérifier que le fichier backup existe 
if [[ ! -f "$bck_file" ]]; then
    echo "Erreur : le fichier de backup '$bck_file' n'existe pas" >&2
    exit 1
fi

# ---- 1. Charger les variables depuis le fichier env ---------
#   - `set -a` exporte automatiquement chaque variable lue
#   - Le point (`.`) source le fichier
set -a
source "$env_file"
set +a

echo "📁 Fichier d'environnement utilisé : $env_file"

# ---------- 2. Vérifier que toutes les variables sont présentes ----------
missing=()
[[ -z "$DB_HOSTNAME" ]]     && missing_vars+=("DB_HOSTNAME")
[[ -z "$DB_PORT" ]]     && missing_vars+=("DB_PORT")
[[ -z "$DB_USER" ]] && missing_vars+=("DB_USER")
[[ -z "$DB_PASSWORD" ]] && missing_vars+=("DB_PASSWORD")
[[ -z "$DB_NAME" ]]   && missing_vars+=("DB_NAME")

if (( ${#missing[@]} )); then
    echo "Erreur : variables manquantes dans .env → ${missing[*]}" >&2
    exit 1
fi

DUMP_FILE=$bck_file

# --- ne pas mettre le mot de passe dans la ligne de commande.
export PGPASSWORD="$DB_PASSWORD"

# ---------- 4. Déterminer si la base existe ----------
# On se connecte à la base système « postgres » pour interroger le catalogue
DB_EXISTS=$(psql -h "$DB_HOSTNAME" -p "$DB_PORT" -U "$DB_USER" \
            -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME';")

# ---------- 5. Supprimer puis recréer la base ----------
if [[ "$DB_EXISTS" == "1" ]]; then
    echo "❌ La base '$DB_NAME' existe déjà → suppression du schema public..."
    psql -h "$DB_HOSTNAME" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" <<EOF
    -- Supprimer le schéma public (s'il existe)
    DROP SCHEMA IF EXISTS public CASCADE;

    -- Le recréer
    CREATE SCHEMA public;

    -- Redonner les droits au propriétaire
    GRANT ALL ON SCHEMA public TO $DB_USER;
    GRANT ALL ON SCHEMA public TO public;
EOF

    if (( $? != 0 )); then
        echo "❌ Échec de la suppression de la base." >&2
        exit 1
    fi
fi

# ---------- 4.1. Déterminer le type de dump ----------
#   - Si le fichier a l’extension .sql → dump texte (pg_restore ne le gère pas)
#   - Sinon on suppose un dump au format custom (-Fc) généré par le script de backup
if [[ "$DUMP_FILE" == *.sql ]]; then
    RESTORE_CMD="psql -h \"$DB_HOSTNAME\" -p \"$DB_PORT\" -U \"$DB_USER\" -d \"$DB_NAME\" -f \"$DUMP_FILE\""
else
    RESTORE_CMD="pg_restore -h \"$DB_HOSTNAME\" -p \"$DB_PORT\" -U \"$DB_USER\" -d \"$DB_NAME\" -Fc \"$DUMP_FILE\""
fi

# ---------- 5. Exécuter la restauration ----------
export PGPASSWORD="$DB_PASSWORD"          # transmet le mdp à psql/pg_restore

# On utilise eval pour que les guillemets dans $RESTORE_CMD soient interprétés correctement
eval $RESTORE_CMD
RET=$?

# Nettoyer la variable sensible
unset PGPASSWORD

# ---------- 6. Retour d’information ----------
if (( RET == 0 )); then
    echo "✅ Restauration terminée avec succès → $DUMP_FILE"
else
    echo "❌ Échec de la restauration (code retour : $RET)" >&2
    exit $RET
fi