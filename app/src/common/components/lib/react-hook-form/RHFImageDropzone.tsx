import {
  Badge,
  Box,
  Button,
  FormLabel,
  Grid,
  IconButton,
  Skeleton,
  SxProps,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { memo, useEffect, useState } from 'react';
import UploadIcon from '@mui/icons-material/FileUploadOutlined';
import InfoIcon from '@mui/icons-material/Info';
import palette from '@common/theme/palette';
import { Upload } from '@modules/uploads/defs/types';
import Image from 'next/image';
import useUploads from '@modules/uploads/hooks/api/useUploads';
import { useSnackbar } from 'notistack';
import { Theme } from '@emotion/react';
import { AutoDelete, Close, OpenInNew, Undo } from '@mui/icons-material';
import { useUploadFormContext } from '@common/contexts/UploadFormContext';
import { useTranslation } from 'react-i18next';

interface RHFImageDropzoneMainProps {
  name: string;
  readOnly?: boolean;
  placeholder?: string;
  upload?: Upload;
  sx?: SxProps<Theme>;
  style?: React.CSSProperties;
  resolution?: `${number}x${number}`;
  maxSize?: number; // Maximum size in kb
  deleteImmediately?: boolean;
  onChange?: (name: string, file: Upload | null) => void;
}

type ConditionalRHFUploadOptions =
  | {
      keyToAssign?: string;
      upsertImmediately?: false;
    }
  | {
      keyToAssign?: never;
      upsertImmediately?: true;
    };

type RHFImageDropzoneProps = RHFImageDropzoneMainProps & ConditionalRHFUploadOptions;

const RHFImageDropzone = (props: RHFImageDropzoneProps) => {
  const {
    name,
    sx,
    style,
    maxSize,
    resolution,
    readOnly = false,
    onChange = () => {},
    deleteImmediately = false,
    upsertImmediately = true,
    keyToAssign,
    placeholder = "Choisir l'image à télécharger",
  } = props;
  const { createOne, updateOne, deleteOne } = useUploads();
  const [loading, setLoading] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [upload, setUpload] = useState<Upload | null>(props.upload || null);
  const [uploadToDelete, setUploadToDelete] = useState<Upload | null>(null);
  const { addOrRemoveUploadIdToDelete, addOrRemoveFilesToUpload } = useUploadFormContext();
  const { t } = useTranslation(['common']);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      let uploaded: Upload | null = null;

      if (maxSize && file.size / 1000 > maxSize) {
        enqueueSnackbar(t('common:file_size_error', { maxSize: maxSize / 1000 }), {
          variant: 'error',
        });
        return false;
      }
      setLoading(true);
      if (upsertImmediately) {
        if (upload) {
          const res = await updateOne(
            upload.id,
            { file },
            { displayProgress: true, displaySuccess: true }
          );
          if (res.data) {
            uploaded = res.data?.item;
          }
        } else {
          const res = await createOne({ file }, { displayProgress: true, displaySuccess: true });
          if (res.data) {
            uploaded = res.data?.item;
          }
        }
      } else {
        uploaded = {
          id: upload?.id || 0,
          path: '',
          url: URL.createObjectURL(file),
          createdAt: '',
          updatedAt: '',
        };
        addOrRemoveFilesToUpload(keyToAssign || ``, file, upload?.id);
      }

      if (uploaded) {
        onChange(name, uploaded);
        setUpload(uploaded);
        setLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    if (deleteImmediately && upload && upload.id) {
      setLoading(true);
      const res = await deleteOne(upload.id, { displayProgress: true, displaySuccess: true });
      if (res.success) {
        setUpload(null);
        onChange(name, null);
        setLoading(false);
      } else {
        enqueueSnackbar(t('common:delete_file_error'), {
          variant: 'error',
        });
      }
    } else if (upload) {
      if (upload.id) {
        setUploadToDelete(upload);
        addOrRemoveUploadIdToDelete(upload.id);
      } else if (!upsertImmediately && keyToAssign) {
        addOrRemoveFilesToUpload(keyToAssign);
      }
      onChange(name, null);
      setUpload(null);
    } else {
      enqueueSnackbar(t('common:no_file_in_dropzone'), {
        variant: 'warning',
      });
    }
  };

  const openPreview = () => {
    if (upload) {
      window.open(upload.url, '_blank');
    }
  };

  const toggleShowUndo = () => {
    setShowUndo(!showUndo);
  };

  const undo = () => {
    if (uploadToDelete) {
      onChange(name, uploadToDelete);
      setUpload(uploadToDelete);
      addOrRemoveUploadIdToDelete(uploadToDelete.id, true);
      setUploadToDelete(null);
    }
  };

  useEffect(() => {
    setUpload(props.upload ?? null);
  }, [props.upload]);

  return (
    <Box sx={{ width: '100%' }}>
      <Badge
        badgeContent={
          <IconButton
            onMouseEnter={() => toggleShowUndo()}
            onMouseLeave={() => toggleShowUndo()}
            onClick={() => undo()}
          >
            {showUndo ? (
              <Undo sx={{ color: 'white' }} fontSize="small" />
            ) : (
              <AutoDelete sx={{ color: 'white' }} fontSize="small" />
            )}
          </IconButton>
        }
        color={showUndo ? 'secondary' : 'error'}
        invisible={!deleteImmediately ? uploadToDelete == null : true}
        sx={{
          display: 'block',
          '& .MuiBadge-badge': {
            height: 'unset',
            padding: 0,
            borderRadius: 999,
          },
        }}
      >
        <FormLabel
          htmlFor={readOnly || loading ? undefined : name}
          sx={{
            border: `${upload || loading ? '1px solid' : '2px dotted'} ${palette.grey[400]}`,
            borderColor: palette.grey[400],
            background: palette.grey[100],
            flex: 1,
            display: 'flex',
            borderRadius: 1,
            overflow: 'hidden',
            cursor: readOnly ? 'default' : 'pointer',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            ...sx,
          }}
          style={{
            ...style,
          }}
        >
          {loading ? (
            <Skeleton height="100%" variant="rectangular" animation="pulse" sx={{ flex: 1 }} />
          ) : (
            upload && (
              <>
                <Image
                  alt=""
                  layout="fill"
                  src={upload.url}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <Box sx={{ position: 'absolute', top: 4, right: 4, display: 'flex' }}>
                  <Tooltip title={t('common:preview_in_new_tab')}>
                    <Button
                      color="secondary"
                      variant="text"
                      sx={{
                        minWidth: 'unset',
                        paddingX: '6px',
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openPreview();
                      }}
                    >
                      <OpenInNew />
                    </Button>
                  </Tooltip>
                  <Button
                    color="error"
                    variant="text"
                    sx={{
                      minWidth: 'unset',
                      paddingX: '6px',
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete();
                    }}
                  >
                    <Close />
                  </Button>
                </Box>
              </>
            )
          )}

          {!readOnly && !loading && !upload && (
            <Grid container alignItems="center" flexDirection="column" gap="5px">
              <UploadIcon />
              {placeholder && (
                <>
                  <Typography
                    sx={{ mt: '10px' }}
                    variant="body1"
                    fontWeight="600"
                    textAlign="center"
                  >
                    {t(placeholder)}
                  </Typography>
                  {maxSize && (
                    <Typography
                      variant="body2"
                      sx={{ textAlign: 'center', fontVariantNumeric: 'lining-nums' }}
                    >
                      {t('common:max_file_size')} <strong>{maxSize / 1000}mb</strong>
                    </Typography>
                  )}
                </>
              )}
              {resolution && (
                <Grid
                  display="flex"
                  gap="5px"
                  alignItems="center"
                  justifyContent="center"
                  marginTop="5px"
                >
                  <Tooltip title={t('common:resolution_tooltip')}>
                    <InfoIcon fontSize="inherit" />
                  </Tooltip>
                  <Typography
                    variant="caption"
                    sx={{ textAlign: 'center', fontVariantNumeric: 'lining-nums' }}
                  >
                    {t(placeholder) && <>{t('common:recommended_resolution')}:</>}{' '}
                    <strong>{resolution}</strong>
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </FormLabel>
      </Badge>

      <input
        hidden
        name={name}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        id={readOnly || loading ? undefined : name}
      />
    </Box>
  );
};

export default memo(RHFImageDropzone);
