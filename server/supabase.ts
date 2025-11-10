import { createClient } from "@supabase/supabase-js";
import { Readable } from "stream";

// Variáveis de ambiente para o Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_BUCKET_NAME) {
  console.error("ERRO: Variáveis de ambiente do Supabase não configuradas.");
  process.exit(1);
}

// Cria o cliente Supabase usando a chave service_role para acesso administrativo
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
});

/**
 * Converte um stream Readable em um Buffer.
 * @param stream O stream Readable a ser convertido.
 * @returns Uma Promise que resolve para o Buffer.
 */
function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

/**
 * Faz o upload de um stream para o Supabase Storage.
 * @param path O caminho do arquivo dentro do bucket.
 * @param body O stream Readable do conteúdo.
 * @returns A URL pública do arquivo.
 */
export async function uploadToSupabase(path: string, body: Readable) {
  console.log(`Iniciando upload para Supabase Storage: ${SUPABASE_BUCKET_NAME}/${path}`);
  
  try {
    // O Supabase Storage API espera um Buffer ou Blob, não um Stream.
    const buffer = await streamToBuffer(body);

    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .upload(path, buffer, {
        contentType: "application/sql",
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // A URL pública é construída manualmente, pois a chave service_role não deve expor URLs públicas
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET_NAME}/${data.path}`;
    
    console.log("Upload Supabase concluído:", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("Erro ao fazer upload para Supabase Storage:", error);
    throw error;
  }
}
