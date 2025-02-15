const Utils = {
  prettyNumber: (value: number, decimals = 2) => {
    return (Math.floor(value * 100) / 100).toFixed(decimals);
  },
  countLabel: (value: number, singular: string, plural: string) => {
    return `${value} ${value === 1 ? singular : plural}`;
  },
};

export default Utils;
