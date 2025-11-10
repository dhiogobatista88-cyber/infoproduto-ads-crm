import { spawn } from "child_process";
import { parse as parseUrl } from "url";
import { uploadToSupabase } from "./supabase";
import { Readable } from "stream";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("ERRO: Variável de ambiente DATABASE_URL não configurada.");
  process.exit(1);
}

async function runBackup() {
  try {
    const dbUrl = parseUrl(DATABASE_URL);
    
    if (!dbUrl.hostname || !dbUrl.auth || !dbUrl.pathname) {
      throw new Error("DATABASE_URL inválida ou incompleta.");
    }

    const [user, password] = dbUrl.auth.split(":");
    const database = dbUrl.pathname.substring(1); // Remove a barra inicial

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = `backup-${database}-${timestamp}.sql`;
    const supabasePath = `db-backups/${backupFileName}`;

    console.log(`Iniciando mysqldump para o banco: ${database}`);

    // Comando mysqldump
    const mysqldump = spawn("mysqldump", [
      "-h", dbUrl.hostname,
      "-P", dbUrl.port || "3306",
      "-u", user,
      `-p${password}`, // Formato sem espaço para a senha
      database,
      "--single-transaction",
      "--skip-lock-tables",
    ]);

    // O output do mysqldump (stdout) é um stream
    const uploadPromise = uploadToSupabase(supabasePath, mysqldump.stdout as Readable);

    // Captura erros do mysqldump
    mysqldump.stderr.on("data", (data) => {
      console.error(`mysqldump ERRO: ${data}`);
    });

    // Aguarda o processo mysqldump terminar
    const dumpPromise = new Promise<void>((resolve, reject) => {
      mysqldump.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`mysqldump falhou com código de saída ${code}`));
        }
      });
    });

    // Aguarda o dump e o upload
    await Promise.all([dumpPromise, uploadPromise]);

    console.log(`Backup concluído com sucesso e enviado para o Supabase Storage.`);

  } catch (error) {
    console.error("Falha na execução do backup:", error);
    process.exit(1);
  }
}

runBackup();
