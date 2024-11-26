export interface FeeRate {
  name: string;
  percentage: number;
  fixed: number;
  currency: string;
  description?: string;
}

export interface CountryFees {
  name: string;
  currency: string;
  currencySymbol: string;
  rates: FeeRate[];
}

// Helper function to parse fee string like "5.4% + $.30" or "2.6% + $.30 (Online payments)"
function parseFeeString(feeString: string): { percentage: number; fixed: number; description?: string } {
  try {
    // Extract description if exists
    const description = feeString.match(/\((.*?)\)/)?.[1];
    // Clean the string by removing description and any extra spaces
    const cleanString = feeString.replace(/\s*\([^)]*\)/g, '').trim();

    // Handle special cases where there's no fixed amount (e.g., "1.95% (PayPal Here card reader)")
    if (!cleanString.includes('+')) {
      const percentMatch = cleanString.match(/(\d+[.,]?\d*)%/);
      if (percentMatch) {
        return {
          percentage: parseFloat(percentMatch[1].replace(',', '.')),
          fixed: 0,
          description
        };
      }
    }

    // Normal case with percentage and fixed amount
    const parts = cleanString.split('+').map(s => s.trim());
    if (parts.length !== 2) {
      throw new Error(`Invalid fee string format: ${feeString}`);
    }

    // Parse percentage
    const percentMatch = parts[0].match(/(\d+[.,]?\d*)%/);
    if (!percentMatch) {
      throw new Error(`Invalid percentage format in: ${parts[0]}`);
    }
    const percentage = parseFloat(percentMatch[1].replace(',', '.'));

    // Parse fixed amount
    const fixedMatch = parts[1].match(/[\d.,]+/);
    if (!fixedMatch) {
      throw new Error(`Invalid fixed amount format in: ${parts[1]}`);
    }
    const fixed = parseFloat(fixedMatch[0].replace(',', '.'));

    return { percentage, fixed, description };
  } catch (error) {
    console.error(`Error parsing fee string: "${feeString}"`, error);
    return { percentage: 0, fixed: 0 };
  }
}

// Currency symbols mapping
const currencySymbols: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
  CAD: 'C$',
  BRL: 'R$',
  CZK: 'Kč',
  DKK: 'kr',
  HKD: 'HK$',
  HUF: 'Ft',
  ILS: '₪',
  JPY: '¥',
  MYR: 'RM',
  MXN: 'Mex$',
  TWD: 'NT$',
  NZD: 'NZ$',
  NOK: 'kr',
  PHP: '₱',
  PLN: 'zł',
  SGD: 'S$',
  SEK: 'kr',
  CHF: 'Fr',
  THB: '฿',
};

// Import the raw fee data
import rawFeeData from './paypal_fees.json';

// Process the raw fee data into our structured format
export const countryFees: CountryFees[] = Object.entries(rawFeeData).map(([countryName, feeRates]) => {
  // Extract currency and clean country name
  const currencyMatch = countryName.match(/\((.*?)\)/);
  const currency = currencyMatch ? currencyMatch[1] : 'USD';
  const name = countryName.replace(/\s*\([^)]*\)/, '').trim();

  // Process all rates and remove duplicates
  const rates: FeeRate[] = [];
  
  (feeRates as string[]).forEach((rateStr) => {
    const { percentage, fixed, description } = parseFeeString(rateStr);
    if (percentage > 0) { // Only add valid rates
      rates.push({
        name: description || `Standard Rate ${percentage}%`,
        percentage,
        fixed,
        currency,
        description
      });
    }
  });

  return {
    name,
    currency,
    currencySymbol: currencySymbols[currency] || currency,
    rates: rates.sort((a, b) => a.percentage - b.percentage) // Sort rates by percentage
  };
});

// Default country (United States)
export const defaultCountry = countryFees.find(country => 
  country.name.toLowerCase() === 'united states' || 
  country.name.toLowerCase() === 'usa'
) || countryFees[0];
