#!/bin/bash

# Ermittelt das Verzeichnis, in dem sich das Skript befindet
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Geht zum Projekt-Root-Verzeichnis (ein Level über bin)
PROJECT_ROOT="$SCRIPT_DIR/.."

# Pfad zum dist Ordner
DIST_DIR="$PROJECT_ROOT/dist"

if [ -d "$DIST_DIR" ]; then
    echo "Lösche Inhalt von $DIST_DIR..."
    rm -rf "$DIST_DIR"
    echo "Fertig."
else
    echo "Verzeichnis $DIST_DIR existiert nicht."
fi
