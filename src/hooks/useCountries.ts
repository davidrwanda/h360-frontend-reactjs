import { useQuery } from '@tanstack/react-query';

interface CountryOption {
  value: string;
  label: string;
}

interface RestCountry {
  name: { common: string };
  cca2: string;
}

// Fallback list of common countries in case the API is unavailable
const FALLBACK_COUNTRIES: CountryOption[] = [
  { value: 'Rwanda', label: 'Rwanda' },
  { value: 'Burundi', label: 'Burundi' },
  { value: 'DR Congo', label: 'DR Congo' },
  { value: 'Kenya', label: 'Kenya' },
  { value: 'Tanzania', label: 'Tanzania' },
  { value: 'Uganda', label: 'Uganda' },
  { value: 'South Africa', label: 'South Africa' },
  { value: 'Nigeria', label: 'Nigeria' },
  { value: 'Ethiopia', label: 'Ethiopia' },
  { value: 'Ghana', label: 'Ghana' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Canada', label: 'Canada' },
  { value: 'France', label: 'France' },
  { value: 'Germany', label: 'Germany' },
  { value: 'Belgium', label: 'Belgium' },
  { value: 'India', label: 'India' },
  { value: 'China', label: 'China' },
  { value: 'Japan', label: 'Japan' },
  { value: 'Australia', label: 'Australia' },
];

const fetchCountries = async (): Promise<CountryOption[]> => {
  const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2');
  if (!response.ok) {
    throw new Error('Failed to fetch countries');
  }
  const data: RestCountry[] = await response.json();

  return data
    .map((c) => ({
      value: c.name.common,
      label: c.name.common,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

export const useCountries = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });

  return {
    countries: data || FALLBACK_COUNTRIES,
    isLoading,
    error,
  };
};

export const DEFAULT_COUNTRY = 'Rwanda';
