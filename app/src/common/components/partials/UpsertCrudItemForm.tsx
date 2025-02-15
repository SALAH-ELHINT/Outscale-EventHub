import Card from '@mui/material/Card';
import { Stack } from '@mui/system';
import Grid from '@mui/material/Grid';
import FormProvider from '@common/components/lib/react-hook-form';
import * as Yup from 'yup';
import { DeepPartial, DefaultValues, FieldValues, UseFormReturn, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import Skeleton from '@mui/material/Skeleton';
import Button from '@mui/material/Button';
import { useRouter } from 'next/router';
import React, { Ref, forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Any, AnyObject, CrudObject, CrudAppRoutes } from '@common/defs/types';
import { ItemResponse, UseItems } from '@common/hooks/useItems';
import { useSnackbar } from 'notistack';
import { Tab, Tabs } from '@mui/material';
import useUploads from '@modules/uploads/hooks/api/useUploads';
import { useUploadFormContext } from '@common/contexts/UploadFormContext';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

export interface CurrentFormStepRef<
  CreateOneInput extends FieldValues = Any,
  UpdateOneInput extends FieldValues = Any
> {
  submit: () => Promise<FormSubmitResponse<AnyObject>>;
  methods: UseFormReturn<CreateOneInput | UpdateOneInput>;
}

export interface FormSubmitResponse<T> {
  data: T;
  errors: AnyObject;
  hasErrors: boolean;
}
export interface PresubmitResponse<CreateOneInput, UpdateOneInput> {
  error?: string;
  data: CreateOneInput | UpdateOneInput;
}

export enum FORM_MODE {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  PATCH = 'PATCH',
}

export interface FormTabs<TAB_ENUM> {
  items: {
    label: string;
    value: TAB_ENUM;
    component?: React.ReactNode;
  }[];
  formItem: TAB_ENUM;
}

export interface UpsertCrudItemFormProps<
  Item,
  CreateOneInput extends FieldValues = Any,
  UpdateOneInput extends FieldValues = Any,
  TAB_ENUM = Any
> {
  item?: Item;
  routes: CrudAppRoutes;
  useItems: UseItems<Item, CreateOneInput, UpdateOneInput>;
  schema: Yup.ObjectSchema<AnyObject>;
  defaultValues: DeepPartial<CreateOneInput | UpdateOneInput>;
  children: JSX.Element;
  displayCard?: boolean;
  displayFooter?: boolean;
  tabs?: FormTabs<TAB_ENUM>;
  afterFooter?: JSX.Element;
  mode?: FORM_MODE;
  onWatch?: (values: CreateOneInput | UpdateOneInput) => void;
  onPreSubmit?: (
    data: CreateOneInput | UpdateOneInput
  ) => PresubmitResponse<CreateOneInput, UpdateOneInput>;
  onPostSubmit?: (
    data: CreateOneInput | UpdateOneInput,
    response: ItemResponse<Item>,
    methods: UseFormReturn<CreateOneInput | UpdateOneInput>
  ) => void;
}

const UpsertCrudItemForm = <
  Item extends CrudObject,
  CreateOneInput extends FieldValues = Any,
  UpdateOneInput extends FieldValues = Any,
  TAB_ENUM = Any
>(
  {
    displayCard = true,
    displayFooter = true,
    ...props
  }: UpsertCrudItemFormProps<Item, CreateOneInput, UpdateOneInput, TAB_ENUM>,
  ref: Ref<CurrentFormStepRef | undefined>
) => {
  const {
    item,
    routes,
    useItems,
    schema,
    defaultValues,
    children,
    tabs,
    mode = FORM_MODE.CREATE,
    onPreSubmit,
    onPostSubmit,
  } = props;
  const { enqueueSnackbar } = useSnackbar();
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();
  const { createOne, updateOne, patchOne } = useItems();
  const { createOne: createOneUpload, updateOne: updateOneUpload, deleteMulti } = useUploads();
  const [previousData, setPreviousData] = useState<CreateOneInput | UpdateOneInput>();
  const methods = useForm<CreateOneInput | UpdateOneInput>({
    resolver: yupResolver(schema),
    defaultValues: defaultValues as DefaultValues<CreateOneInput | UpdateOneInput>,
  });
  const [currentTab, setCurrentTab] = useState(tabs?.formItem);
  const { uploadsIdsToDelete, filesToUpload } = useUploadFormContext() ?? {
    uploadsIdsToDelete: [],
    filesToUpload: [],
  };

  const { t } = useTranslation(['common']);

  const {
    handleSubmit,
    formState: { isSubmitting },
    getValues,
  } = methods;

  const data = methods.watch();

  useEffect(() => {
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!previousData || (previousData && !_.isEqual(previousData, data))) {
      if (props.onWatch) {
        props.onWatch(data);
      }
      setPreviousData(data);
    }
  }, [data]);

  const onSubmit = async (data: CreateOneInput | UpdateOneInput) => {
    if (onPreSubmit) {
      const preSubmitResponse = onPreSubmit(data);
      const error = preSubmitResponse.error;
      if (error) {
        enqueueSnackbar(error, { variant: 'error' });
        return;
      }
      data = preSubmitResponse.data;
    }
    let response;

    if (filesToUpload && filesToUpload.length > 0) {
      const uploads = await filesToUpload.reduce(async (uploads, fileToUpload) => {
        if (uploads instanceof Promise) {
          uploads = await uploads;
        }
        const { data, success } = fileToUpload.uploadId
          ? await updateOneUpload(fileToUpload.uploadId, { file: fileToUpload.file })
          : await createOneUpload({ file: fileToUpload.file });
        const uploadId = success ? data?.item.id : null;
        return {
          ...uploads,
          ...(uploadId && { [fileToUpload.key]: uploadId }),
        };
      }, {});
      data = { ...data, ...uploads };
    }

    if (mode === FORM_MODE.UPDATE && item) {
      response = await updateOne(item.id, data as UpdateOneInput, {
        displayProgress: true,
        displaySuccess: true,
      });
    } else if (mode === FORM_MODE.PATCH && item) {
      response = await patchOne(item.id, data as Partial<UpdateOneInput>, {
        displayProgress: true,
        displaySuccess: true,
      });
    } else {
      response = await createOne(data as CreateOneInput, {
        displayProgress: true,
        displaySuccess: true,
      });
    }
    if (response.success) {
      if (uploadsIdsToDelete && uploadsIdsToDelete.length > 0) {
        deleteMulti(uploadsIdsToDelete);
      }
      if (onPostSubmit) {
        onPostSubmit(data, response, methods);
      }
    }
  };

  const currentTabComponent = tabs
    ? tabs.items.find((tab) => tab.value === currentTab)?.component
    : null;

  useImperativeHandle(ref, () => ({
    submit: async () => {
      let errors = {};
      await handleSubmit(
        async () => {},
        async (formErrors) => {
          errors = formErrors;
        }
      )();
      const data = getValues();
      const hasErrors = Object.keys(methods.formState.errors).length > 0;
      return { data, errors, hasErrors };
    },
    methods,
  }));

  const displayForm = () => {
    return (
      <>
        {loaded ? (
          <>
            {tabs && mode === FORM_MODE.UPDATE && (
              <>
                <Tabs
                  value={currentTab}
                  onChange={(_event, tab) => {
                    setCurrentTab(tab);
                  }}
                >
                  {tabs.items.map((tab) => (
                    <Tab label={tab.label} value={tab.value} />
                  ))}
                </Tabs>
                {currentTabComponent}
              </>
            )}
            {(!tabs || mode === FORM_MODE.CREATE || currentTab === tabs.formItem) && (
              <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                {children}
                {displayFooter && (
                  <Stack direction="row" justifyContent="center" alignItems="center" paddingY={2}>
                    <Button
                      size="large"
                      variant="text"
                      onClick={() => router.push(routes.ReadAll)}
                      sx={{ marginRight: 2 }}
                    >
                      {t('common:return')}
                    </Button>
                    <LoadingButton
                      size="large"
                      type="submit"
                      variant="contained"
                      loading={isSubmitting}
                    >
                      {t('common:save')}
                    </LoadingButton>
                    {props.afterFooter}
                  </Stack>
                )}
              </FormProvider>
            )}
          </>
        ) : (
          <Stack justifyContent="center" alignItems="center" spacing={4} padding={4}>
            <Grid container spacing={2} columns={{ xs: 1, md: 2 }} paddingX={4}>
              {Array.from(Array(4)).map((_, index) => (
                <Grid item xs={1} key={index}>
                  <Skeleton variant="rectangular" height={35} />
                </Grid>
              ))}
            </Grid>
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
              <Skeleton variant="rectangular" height={35} width={150} />
              <Skeleton variant="rectangular" height={35} width={150} />
            </Stack>
          </Stack>
        )}
      </>
    );
  };
  return <>{displayCard ? <Card>{displayForm()}</Card> : displayForm()}</>;
};

type ForwardRefFn<T> = <
  Item,
  CreateOneInput extends FieldValues = Any,
  UpdateOneInput extends FieldValues = Any,
  TAB_ENUM = Any
>(
  props: UpsertCrudItemFormProps<Item, CreateOneInput, UpdateOneInput, TAB_ENUM> & {
    ref?: Ref<T | undefined>;
  }
) => JSX.Element;

export default forwardRef(UpsertCrudItemForm) as ForwardRefFn<CurrentFormStepRef>;
