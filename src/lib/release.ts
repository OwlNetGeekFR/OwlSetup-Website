// Métadonnées de la dernière Release stable, lues au build depuis release.json.
// Le workflow horaire met ce fichier à jour puis reconstruit le site : les
// versions, tailles et empreintes affichées sont donc toujours celles publiées.
import manifest from "../../release.json";

type Asset = { url: string; size: number; sha256: string | null };
type Manifest = {
  schemaVersion: number;
  version: string;
  tag: string;
  publishedAt: string;
  releaseUrl: string;
  assets: Record<string, Asset>;
};

const data = manifest as Manifest;

if (data.schemaVersion !== 1 || !/^\d+\.\d+\.\d+$/.test(data.version)) {
  throw new Error("release.json : version de manifeste ou numéro de version invalide.");
}
for (const name of ["OwlSetup-Setup.exe", "OwlSetup.exe", "SHA256.txt"]) {
  if (!data.assets[name]?.url) throw new Error(`release.json : fichier absent (${name}).`);
}
for (const name of ["OwlSetup-Setup.exe", "OwlSetup.exe"]) {
  if (!/^[A-F0-9]{64}$/.test(data.assets[name].sha256 ?? "")) {
    throw new Error(`release.json : empreinte SHA-256 invalide (${name}).`);
  }
}

const megabytes = (bytes: number) =>
  `${(bytes / 1024 / 1024).toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Mo`;

const shortHash = (hash: string) => `${hash.slice(0, 8)}…${hash.slice(-8)}`;

const file = (name: string) => {
  const asset = data.assets[name];
  const sha256 = asset.sha256 ?? "";
  return { name, url: asset.url, size: megabytes(asset.size), sha256, shortHash: sha256 && shortHash(sha256) };
};

const published = new Date(data.publishedAt);

export const release = {
  version: data.version,
  tag: data.tag,
  notesUrl: data.releaseUrl,
  publishedIso: data.publishedAt.slice(0, 10),
  publishedLabel: new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(published),
  installer: file("OwlSetup-Setup.exe"),
  portable: file("OwlSetup.exe"),
  checksumsUrl: data.assets["SHA256.txt"].url,
};

export const manifestJson = data;
