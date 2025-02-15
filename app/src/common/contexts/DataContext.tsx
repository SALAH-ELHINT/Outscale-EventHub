import { createContext, useContext, useMemo, useState } from 'react';

interface Data {}

export const defaultData: Data = {};

export type UseData = {
  data: Data;
  setData: React.Dispatch<React.SetStateAction<Data>>;
};

export const useData = (_newValue: Data): UseData => {
  const [data, setData] = useState<Data>(defaultData);

  return { data, setData };
};

interface Props {
  children: React.ReactNode;
}

export const DataContext = createContext<UseData>(undefined!);

const DataProvider = ({ children }: Props) => {
  const { data, setData } = useData(defaultData);

  const value = useMemo(() => ({ data, setData }), [data, setData]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

const useDataContext = () => {
  return useContext(DataContext);
};

export { DataProvider, useDataContext };
