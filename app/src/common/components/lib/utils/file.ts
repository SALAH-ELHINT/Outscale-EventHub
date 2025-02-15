export const trimFileName = (name: string): string => {
  if (name.length > 60) {
    const splitedName = name.split('.');
    let filename = splitedName[0];
    const extension = splitedName[splitedName.length - 1];
    filename = filename.substring(0, 25) + '...' + filename.slice(-25);
    return `${filename}.${extension}`;
  }
  return name;
};
