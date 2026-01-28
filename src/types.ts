export interface AudioData {
  wav: string;
  lyrics: string;
}

export interface AudioItem {
  uuid: string;
  [key: string]: string | AudioData; // Allow dynamic keys like melody_GT, rebuild_01, rebuild_02, rebuild_03
}

export function isAudioData(value: unknown): value is AudioData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'wav' in value &&
    'lyrics' in value
  );
}
