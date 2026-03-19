export interface AppConfig {
  API_BASE_URL: string;
  IDP_AUTHORITY: string;
  IDP_CLIENT: string;
  API_GEO_URL: string;
}

let config: AppConfig | null = null;

export async function loadConfig(): Promise<AppConfig> {
  const response = await fetch("/config.json");
  if (!response.ok) {
    throw new Error(`Failed to load config: ${response.status}`);
  }
  config = await response.json();
  return config!;
}

export function getConfig(): AppConfig {
  if (!config) {
    throw new Error(
      "Config not loaded. Call loadConfig() before accessing config.",
    );
  }
  return config;
}
