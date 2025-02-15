import { Palette, TypeAction } from '@mui/material';

type CustomPalette = Omit<
  Palette,
  'mode' | 'augmentColor' | 'contrastThreshold' | 'tonalOffset' | 'getContrastText' | 'action'
> & {
  action: Omit<TypeAction, 'selectedOpacity' | 'focusOpacity' | 'activatedOpacity'>;
};

export default CustomPalette;
