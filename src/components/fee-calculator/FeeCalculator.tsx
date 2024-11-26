import React, { useState } from 'react';
import paypalFees from './paypal_fees.json';

const FeeCalculator: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('United States (USD)');
  const [selectedRate, setSelectedRate] = useState<string>(paypalFees['United States (USD)'][0]);
  const [calculationType, setCalculationType] = useState<'send' | 'receive'>('send');

  // Parse the rate string to get percentage and fixed amount
  const parseRate = (rateStr: string) => {
    const percentMatch = rateStr.match(/(\d+\.?\d*)%/);
    const fixedMatch = rateStr.match(/\$(\d+\.?\d*)/);
    return {
      percentage: percentMatch ? parseFloat(percentMatch[1]) : 0,
      fixed: fixedMatch ? parseFloat(fixedMatch[1]) : 0
    };
  };

  const calculateFee = (amount: number) => {
    const { percentage, fixed } = parseRate(selectedRate);
    const fee = (amount * percentage) / 100 + fixed;
    return {
      fee: Number(fee.toFixed(2)),
      finalAmount: calculationType === 'send'
        ? Number((amount - fee).toFixed(2))
        : Number((amount + fee).toFixed(2))
    };
  };

  const formatAmount = (amount: number): string => {
    const currency = selectedCountry.match(/\((.*?)\)/)?.[1] || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleCountryChange = (countryName: string) => {
    setSelectedCountry(countryName);
    setSelectedRate(paypalFees[countryName][0]);
  };

  const result = amount ? calculateFee(parseFloat(amount)) : null;

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 dark:bg-gray-900 rounded-lg shadow-lg p-6 text-white">
      <div className="space-y-6">
        {/* Country Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Country
          </label>
          <select
            className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
            value={selectedCountry}
            onChange={(e) => handleCountryChange(e.target.value)}
          >
            {Object.keys(paypalFees).map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* Fee Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Fee Type
          </label>
          <select
            className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
            value={selectedRate}
            onChange={(e) => setSelectedRate(e.target.value)}
          >
            {paypalFees[selectedCountry].map((rate: string) => (
              <option key={rate} value={rate}>
                {rate}
              </option>
            ))}
          </select>
        </div>

        {/* Calculation Type */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            I want to
          </label>
          <div className="flex gap-4">
            <button
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                calculationType === 'send'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
              }`}
              onClick={() => setCalculationType('send')}
            >
              Send Amount
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                calculationType === 'receive'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
              }`}
              onClick={() => setCalculationType('receive')}
            >
              Receive Amount
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            {calculationType === 'send' ? 'Amount to Send' : 'Amount to Receive'}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {selectedCountry.includes('USD') ? '$' : '€'}
            </span>
            <input
              type="number"
              className="w-full p-3 pl-8 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4 pt-4 border-t border-gray-600">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">PayPal Fee:</span>
              <span className="font-semibold text-gray-200">
                {formatAmount(result.fee)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">
                {calculationType === 'send' ? 'You will receive:' : 'Customer pays:'}
              </span>
              <span className="text-xl font-bold text-blue-400">
                {formatAmount(result.finalAmount)}
              </span>
            </div>
          </div>
        )}

        {/* Fee Details */}
        <div className="text-sm text-gray-400 pt-4 border-t border-gray-600">
          <p>Current Rate: {selectedRate}</p>
        </div>
      </div>
    </div>
  );
};

export default FeeCalculator;
