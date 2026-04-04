#!/usr/bin/env bash
# ------------------------------------------------------------
# – Sauvegarde d'une base PostgreSQL avec pg_dump
# ------------------------------------------------------------

# ---- 0. Évaluer les arguments --------------------------------
env_file="$(dirname "$0")/.env"  # fichier par défaut

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
        *)
            echo "Option inconnue : $1" >&2
            echo "Usage : $0 [--env fichier_env]" >&2
            exit 1
            ;;
    esac
done

# Vérifier que le fichier d'environnement existe
if [[ ! -f "$env_file" ]]; then
    echo "Erreur : le fichier d'environnement '$env_file' n'existe pas" >&2
    exit 1
fi

# ---- 1. Charger les variables depuis le fichier env ---------
#   - `set -a` exporte automatiquement chaque variable lue
#   - Le point (`.`) source le fichier
set -a
source "$env_file"
set +a

echo "📁 Fichier d'environnement utilisé : $env_file"

# ---- 2. Vérifier que toutes les variables sont présentes ----
missing_vars=()
[[ -z "$DB_HOSTNAME" ]]     && missing_vars+=("DB_HOSTNAME")
[[ -z "$DB_PORT" ]]     && missing_vars+=("DB_PORT")
[[ -z "$DB_USER" ]] && missing_vars+=("DB_USER")
[[ -z "$DB_PASSWORD" ]] && missing_vars+=("DB_PASSWORD")
[[ -z "$DB_NAME" ]]   && missing_vars+=("DB_NAME")

if (( ${#missing_vars[@]} )); then
    echo "Erreur : les variables suivantes ne sont pas définies dans .env : ${missing_vars[*]}" >&2
    exit 1
fi

# ---- 3. Construire le nom du fichier de sauvegarde ----------
timestamp=$(date +'%Y%m%d_%H%M%S')
backup_file="backup_${DB_HOSTNAME}_${DB_NAME}_${timestamp}.bck"

# ---- 4. Exécuter pg_dump ------------------------------------
#   - PGPASSWORD permet de passer le mot de passe sans interaction
#   - `-Fc` (format custom) est souvent plus pratique que le texte brut,
#     mais vous pouvez le remplacer par `-Fp` ou rien du tout.
export PGPASSWORD="$DB_PASSWORD"

pg_dump -h "$DB_HOSTNAME" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -Fc -f "$backup_file"
dump_status=$?

# Nettoyer la variable d’environnement sensible
unset PGPASSWORD

# ---- 5. Vérifier le résultat --------------------------------
if (( dump_status == 0 )) && [[ -f "$backup_file" ]]; then
    echo "✅ Sauvegarde réussie → $backup_file"
else
    echo "❌ Échec de la sauvegarde (code retour : $dump_status)" >&2
    # Optionnel : supprimer le fichier partiellement créé
    [[ -f "$backup_file" ]] && rm -f "$backup_file"
    exit 1
fi