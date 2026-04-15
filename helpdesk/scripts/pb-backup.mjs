import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const pocketBaseDir = path.join(projectRoot, "pocketbase");
const sourceDir = path.join(pocketBaseDir, "pb_data");
const backupsRoot = path.join(projectRoot, "backups", "pocketbase");
const timestamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const targetDir = path.join(backupsRoot, `backup-${timestamp}`);

if (!fs.existsSync(sourceDir)) {
  throw new Error(`No existe el directorio de datos PocketBase: ${sourceDir}`);
}

fs.mkdirSync(backupsRoot, { recursive: true });
fs.cpSync(sourceDir, targetDir, { recursive: true });

const manifest = {
  backupPath: targetDir,
  createdAt: new Date().toISOString(),
  files: {
    auxiliaryDb: fs.existsSync(path.join(targetDir, "auxiliary.db")),
    dataDb: fs.existsSync(path.join(targetDir, "data.db")),
    storageDir: fs.existsSync(path.join(targetDir, "storage")),
  },
  sourcePath: sourceDir,
  type: "pocketbase-pb_data-backup",
};

fs.writeFileSync(path.join(targetDir, "manifest.json"), JSON.stringify(manifest, null, 2));

console.log(JSON.stringify(manifest, null, 2));
