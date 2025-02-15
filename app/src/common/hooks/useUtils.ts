import { Any } from '@common/defs/types';
import { useTranslation } from 'react-i18next';

const useUtils = () => {
  const { i18n } = useTranslation();
  const createURLSearchParams = (params: { [key: string]: Any }): string => {
    const searchParams = new URLSearchParams();

    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (Array.isArray(value)) {
        value
          .filter((item) => item !== undefined && item !== null)
          .forEach((item) => searchParams.append(`${key}[]`, String(item)));
      } else if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    return searchParams.toString();
  };

  const prettyNumber = (value: number, decimals = 2) => {
    return (Math.floor(value * 100) / 100).toFixed(decimals);
  };
  const countLabel = (value: number, singular: string, plural: string) => {
    return `${value} ${value <= 1 ? singular : plural}`;
  };
  const decimalFormat = (value: number) => {
    const decimalsFormatter = Intl.NumberFormat(i18n.language, {
      style: 'decimal',
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    });
    return decimalsFormatter.format(value);
  };

  return {
    createURLSearchParams,
    prettyNumber,
    countLabel,
    decimalFormat,
  };
};

export default useUtils;
