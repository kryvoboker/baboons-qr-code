#!/bin/sh
set -e

umask "${UMASK:-0002}"

exec npm run dev