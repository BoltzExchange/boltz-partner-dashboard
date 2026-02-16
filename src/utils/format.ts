export const truncateString = (value: string, prefixLength = 8, suffixLength = 4): string => {
  if (value.length <= prefixLength + suffixLength) return value;
  return `${value.substring(0, prefixLength)}...${value.substring(value.length - suffixLength)}`;
};

