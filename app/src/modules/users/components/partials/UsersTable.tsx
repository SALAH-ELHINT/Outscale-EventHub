import Routes from '@common/defs/routes';
import ItemsTable from '@common/components/partials/ItemsTable';
import { User } from '@modules/users/defs/types';
import useUsers, { CreateOneInput, UpdateOneInput } from '@modules/users/hooks/api/useUsers';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { GridColumns } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import Namespaces from '@common/defs/namespaces';
import { CrudRow } from '@common/defs/types';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

interface Row extends CrudRow {
  email: string;
  createdAt: string;
  roles: string[];
}

const UsersTable = () => {
  const { t, i18n } = useTranslation(['user']);
  const columns: GridColumns<Row> = [
    {
      field: 'id',
      headerName: 'ID',
      width: 100,
    },
    {
      field: 'email',
      headerName: t('user:list.email'),
      flex: 1,
    },
    {
      field: 'roles',
      headerName: t('user:list.role'),
      type: 'boolean',
      width: 125,
      renderCell: (params) => {
        const { row: item } = params;
        const { roles } = item;
        if (roles.includes('admin')) {
          return <CheckCircleIcon color="success" />;
        }
        return <CancelIcon color="error" />;
      },
    },
    {
      field: 'createdAt',
      headerName: t('user:list.created_at'),
      type: 'dateTime',
      flex: 1,
      renderCell: (params) => dayjs(params.row.createdAt).format('DD/MM/YYYY hh:mm'),
    },
  ];
  const [translatedColumns, setTranslatedColumns] = useState<GridColumns<Row>>(columns);

  useEffect(() => {
    setTranslatedColumns(columns);
  }, [t, i18n.language]);

  const itemToRow = (item: User): Row => {
    return {
      id: item.id,
      email: item.email,
      createdAt: item.createdAt,
      roles: item.rolesNames,
    };
  };

  return (
    <>
      <ItemsTable<User, CreateOneInput, UpdateOneInput, Row>
        namespace={Namespaces.Users}
        routes={Routes.Users}
        useItems={useUsers}
        columns={translatedColumns}
        itemToRow={itemToRow}
        showEdit={() => true}
        showDelete={() => true}
        showLock
        exportable
      />
    </>
  );
};

export default UsersTable;
