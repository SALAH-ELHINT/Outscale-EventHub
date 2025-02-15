import usePermissions from '@modules/permissions/hooks/usePermissions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Permission } from '@modules/permissions/defs/types';

interface PageHeaderProps {
  title: string;
  action?: {
    label: string;
    onClick: () => void;
    permission?: Permission;
    startIcon?: JSX.Element;
  };
}
const PageHeader = (props: PageHeaderProps) => {
  const { can } = usePermissions();
  const action = props.action;
  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" marginBottom={1}>
        <Typography variant="h4" component="h1">
          {props.title}
        </Typography>
        {action &&
          (!action.permission ||
            can(
              action.permission.entity,
              action.permission.action,
              action.permission.entityId
            )) && (
            <Button startIcon={action.startIcon} variant="contained" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
      </Stack>
    </>
  );
};
export default PageHeader;
