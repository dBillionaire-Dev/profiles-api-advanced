export interface Profile {
  id: string;
  name: string;
  gender: string | null;
  gender_probability: number | null;
  sample_size: number | null;
  age: number | null;
  age_group: string | null;
  country_id: string | null;
  country_probability: number | null;
  created_at: string;
}

export interface GenderizeResponse {
  name: string;
  gender: string | null;
  probability: number;
  count: number;
}

export interface AgifyResponse {
  name: string;
  age: number | null;
  count: number;
}

export interface NationalizeResponse {
  name: string;
  country: Array<{ country_id: string; probability: number }>;
}

export interface AggregatedData {
  gender: string;
  gender_probability: number;
  sample_size: number;
  age: number;
  age_group: string;
  country_id: string;
  country_probability: number;
}
