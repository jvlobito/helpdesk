import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const backupsRoot = path.join(projectRoot, "backups", "pocketbase");
const requestedPath = process.env.PB_RESTORE_BACKUP_PATH?.trim();

if (!requestedPath) {
  throw new Error("Define PB_RESTORE_BACKUP_PATH con la ruta absoluta o relativa del respaldo a verificar.");
}

const resolvedBackupPath = path.isAbsolute(requestedPath) ? requestedPath : path.join(projectRoot, requestedPath);
const manifestPath = path.join(resolvedBackupPath, "manifest.json");
const dataDbPath = path.join(resolvedBackupPath, "data.db");
const auxiliaryDbPath = path.join(resolvedBackupPath, "auxiliary.db");
const storagePath = path.join(resolvedBackupPath, "storage");

if (!resolvedBackupPath.startsWith(backupsRoot)) {
  throw new Error("El respaldo a verificar debe vivir dentro de backups/pocketbase.");
}

if (!fs.existsSync(resolvedBackupPath)) {
  throw new Error(`No existe el respaldo indicado: ${resolvedBackupPath}`);
}

if (!fs.existsSync(manifestPath)) {
  throw new Error("El respaldo no contiene manifest.json.");
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

if (!fs.existsSync(dataDbPath)) {
  throw new Error("El respaldo no contiene data.db.");
}

if (!fs.existsSync(auxiliaryDbPath)) {
  throw new Error("El respaldo no contiene auxiliary.db.");
}

if (!fs.existsSync(storagePath)) {
  throw new Error("El respaldo no contiene directorio storage.");
}

console.log(
  JSON.stringify(
    {
      backupPath: resolvedBackupPath,
      checkedAt: new Date().toISOString(),
      manifest,
      mode: "check-only",
      ok: true,
    },
    null,
    2,
  ),
);
