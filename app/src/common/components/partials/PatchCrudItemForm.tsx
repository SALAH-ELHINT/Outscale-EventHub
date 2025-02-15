import { FieldValues } from 'react-hook-form';
import { Any, AnyObject, CrudObject } from '@common/defs/types';
import UpsertCrudItemForm, {
  CurrentFormStepRef,
  FORM_MODE,
  UpsertCrudItemFormProps,
} from '@common/components/partials/UpsertCrudItemForm';
import { Ref, forwardRef } from 'react';

interface PatchCrudItemProps<Item, UpdateOneInput extends FieldValues>
  extends UpsertCrudItemFormProps<Item, Any, UpdateOneInput> {}

const PatchCrudItem = <Item extends CrudObject, UpdateOneInput extends AnyObject>(
  props: PatchCrudItemProps<Item, UpdateOneInput>,
  ref: Ref<CurrentFormStepRef>
) => {
  return (
    <>
      <UpsertCrudItemForm<Item, UpdateOneInput> {...props} mode={FORM_MODE.PATCH} ref={ref}>
        {props.children}
      </UpsertCrudItemForm>
    </>
  );
};

type ForwardRefFn<T> = <Item, UpdateOneInput extends FieldValues = Any>(
  props: PatchCrudItemProps<Item, UpdateOneInput> & {
    ref?: Ref<T | undefined>;
  }
) => JSX.Element;

export default forwardRef(PatchCrudItem) as ForwardRefFn<CurrentFormStepRef>;
