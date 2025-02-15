import { Id } from '@common/defs/types';
import { createContext, useContext, useMemo, useState } from 'react';

interface FileToUpload {
  key: string;
  file: File;
  uploadId?: Id;
}

export type UseUploadForm = {
  uploadsIdsToDelete: Id[];
  filesToUpload: FileToUpload[];
  setUploadsIdsToDelete: React.Dispatch<React.SetStateAction<Id[]>>;
  addOrRemoveUploadIdToDelete: (id: Id, remove?: boolean) => void;
  addOrRemoveFilesToUpload: (key: string, file?: File, uploadId?: Id) => void;
};

export const useUploadForm = (): UseUploadForm => {
  const [uploadsIdsToDelete, setUploadsIdsToDelete] = useState<Id[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<FileToUpload[]>([]);
  const addOrRemoveUploadIdToDelete = (uploadId: Id, remove?: boolean) => {
    if (!remove) {
      setUploadsIdsToDelete((ids) => [...ids, uploadId]);
    } else if (remove) {
      setUploadsIdsToDelete((ids) => ids.filter((id) => id !== uploadId));
    }
  };

  const addOrRemoveFilesToUpload = (key: string, file?: File, uploadId?: Id) => {
    if (file) {
      setFilesToUpload([...filesToUpload, { key, file, ...(uploadId && { uploadId }) }]);
    } else {
      setFilesToUpload(filesToUpload.filter((ftu) => ftu.key !== key));
    }
  };

  return {
    uploadsIdsToDelete,
    setUploadsIdsToDelete,
    addOrRemoveUploadIdToDelete,
    addOrRemoveFilesToUpload,
    filesToUpload,
  };
};

interface Props {
  children: React.ReactNode;
}

export const UploadFormContext = createContext<UseUploadForm>(undefined!);

const UploadFormContextProvider = ({ children }: Props) => {
  const {
    uploadsIdsToDelete,
    setUploadsIdsToDelete,
    addOrRemoveUploadIdToDelete,
    addOrRemoveFilesToUpload,
    filesToUpload,
  } = useUploadForm();

  const value = useMemo(
    () => ({
      uploadsIdsToDelete,
      setUploadsIdsToDelete,
      addOrRemoveUploadIdToDelete,
      addOrRemoveFilesToUpload,
      filesToUpload,
    }),
    [uploadsIdsToDelete, filesToUpload]
  );

  return <UploadFormContext.Provider value={value}>{children}</UploadFormContext.Provider>;
};

const useUploadFormContext = () => {
  return useContext(UploadFormContext);
};

export { UploadFormContextProvider, useUploadFormContext };
