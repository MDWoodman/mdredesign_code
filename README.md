# mdredesign_code

## Aktualizacja katalogów PDF

Nie trzeba ręcznie edytować pliku `katalogi.json`.

Po dodaniu lub usunięciu plików PDF w folderze `katalogi/` uruchom:

```bash
node scripts/generate-catalogs.js
```

Skrypt automatycznie wygeneruje aktualną listę linków w `katalogi.json`.