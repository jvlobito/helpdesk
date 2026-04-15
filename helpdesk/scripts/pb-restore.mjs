import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const backupsRoot = path.join(projectRoot, "backups", "pocketbase");
const pocketBaseDir = path.join(projectRoot, "pocketbase");
const activeDataDir = path.join(pocketBaseDir, "pb_data");
const requestedPath = process.env.PB_RESTORE_BACKUP_PATH?.trim();
const shouldApply = process.env.PB_RESTORE_APPLY === "1";

if (!requestedPath) {
  throw new Error("Define PB_RESTORE_BACKUP_PATH con la ruta del respaldo a restaurar.");
}

const resolvedBackupPath = path.isAbsolute(requestedPath) ? requestedPath : path.join(projectRoot, requestedPath);
const manifestPath = path.join(resolvedBackupPath, "manifest.json");

if (!resolvedBackupPath.startsWith(backupsRoot)) {
  throw new Error("El respaldo a restaurar debe vivir dentro de backups/pocketbase.");
}

if (!fs.existsSync(manifestPath)) {
  throw new Error("El respaldo indicado no contiene manifest.json.");
}

if (!shouldApply) {
  console.log(
    JSON.stringify(
      {
        activeDataDir,
        backupPath: resolvedBackupPath,
        message: "Restore no aplicado. Define PB_RESTORE_APPLY=1 para ejecutar una restauracion real con snapshot previo.",
        ok: true,
        snapshotCreated: false,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (!fs.existsSync(activeDataDir)) {
  throw new Error(`No existe el directorio activo de PocketBase: ${activeDataDir}`);
}

const timestamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const snapshotPath = path.join(backupsRoot, `pre-restore-snapshot-${timestamp}`);

fs.cpSync(activeDataDir, snapshotPath, { recursive: true });
fs.rmSync(activeDataDir, { force: true, recursive: true });
fs.cpSync(resolvedBackupPath, activeDataDir, { recursive: true });

console.log(
  JSON.stringify(
    {
      activeDataDir,
      appliedAt: new Date().toISOString(),
      backupPath: resolvedBackupPath,
      ok: true,
      snapshotCreated: true,
      snapshotPath,
    },
    null,
    2,
  ),
);
