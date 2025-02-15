import { FieldValues } from 'react-hook-form';
import { Any, AnyObject, CrudObject } from '@common/defs/types';
import UpsertItemForm, {
  CurrentFormStepRef,
  UpsertCrudItemFormProps,
} from '@common/components/partials/UpsertCrudItemForm';
import { Ref, forwardRef } from 'react';

interface CreateCrudItemFormProps<Item, CreateOneInput extends FieldValues>
  extends Omit<UpsertCrudItemFormProps<Item, CreateOneInput>, 'item'> {}

const CreateCrudItemForm = <Item extends CrudObject, CreateOneInput extends AnyObject>(
  props: CreateCrudItemFormProps<Item, CreateOneInput>,
  ref: Ref<CurrentFormStepRef>
) => {
  return (
    <>
      <UpsertItemForm<Item, CreateOneInput> {...props} ref={ref}>
        {props.children}
      </UpsertItemForm>
    </>
  );
};

type ForwardRefFn<T> = <Item, CreateOneInput extends FieldValues = Any>(
  props: CreateCrudItemFormProps<Item, CreateOneInput> & {
    ref?: Ref<T | undefined>;
  }
) => JSX.Element;

export default forwardRef(CreateCrudItemForm) as ForwardRefFn<CurrentFormStepRef>;
