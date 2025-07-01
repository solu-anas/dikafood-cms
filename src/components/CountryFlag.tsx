import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api';

interface CountryFlagProps {
  countryCode: string;
  size?: 'small' | 'medium' | 'large';
  showCode?: boolean;
  className?: string;
}

/**
 * CountryFlag component that displays country flags using flagcdn.com
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'US', 'FR', 'MA')
 * @param size - Size of the flag (small: 16px, medium: 24px, large: 32px)
 * @param showCode - Whether to show the country code text next to the flag
 * @param className - Additional CSS classes
 */
export const CountryFlag: React.FC<CountryFlagProps> = ({
  countryCode,
  size = 'medium',
  showCode = false,
  className = ''
}) => {
  if (!countryCode) {
    return showCode ? <span className={className}>N/A</span> : null;
  }

  // Convert to lowercase for flagcdn.com API
  const code = countryCode.toLowerCase();
  
  // Size mapping
  const sizeMap = {
    small: { width: 16, height: 12 },
    medium: { width: 24, height: 18 },
    large: { width: 32, height: 24 }
  };

  const dimensions = sizeMap[size];
  
  const [hasError, setHasError] = useState(false);

  const flagUrl = `${API_BASE_URL}/api/countries/flag?code=${code}`;
  
  if (hasError) {
    return (
      <div 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          border: '1px solid #d9d9d9',
          borderRadius: '2px',
          color: '#8c8c8c',
          fontSize: '10px',
          fontFamily: 'monospace',
          width: dimensions.width,
          height: dimensions.height
        }}
        title={`${countryCode} flag not found`}
      >
        {countryCode.toUpperCase()}
      </div>
    );
  }

  return (
    <div 
      className={className}
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '8px' 
      }}
    >
      <img
        src={flagUrl}
        alt={`${countryCode} flag`}
        width={dimensions.width}
        height={dimensions.height}
        style={{ 
          minWidth: dimensions.width, 
          minHeight: dimensions.height,
          borderRadius: '2px',
          border: '1px solid rgba(0, 0, 0, 0.1)'
        }}
        onError={() => setHasError(true)}
        loading="lazy"
      />
      {showCode && (
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#262626' }}>
          {countryCode.toUpperCase()}
        </span>
      )}
    </div>
  );
};

export default CountryFlag; 