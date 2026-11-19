import React, { ReactNode } from 'react';
import { ListRow, ListSection } from '@ios27_design_system/react';
import AddCircleIcon from '@mui/icons-material/AddCircle';

export type AddActionSectionProps = {
  /** Text of the row, e.g. "Nouvelle liste". */
  label: string;
  /** Opens the relevant editor (ListEditorForm, GiftForm, CreateTribeDialog…). */
  onClick: () => void;
  /** Leading glyph. Defaults to a filled "add" circle. */
  icon?: ReactNode;
  /** Accessible name when it must differ from the visible label. */
  ariaLabel?: string;
};

/**
 * iOS grouped section made of a single tappable "Add…" row, shown at the
 * beginning of a list. It replaces the context-relative "+" button that used
 * to live in the FloatingActionPill, which is now only used for navigation.
 */
const AddActionSection: React.FC<AddActionSectionProps> = ({
  label,
  onClick,
  icon,
  ariaLabel,
}) => (
  <ListSection className="kdo-group kdo-add-section">
    <ListRow
      className="kdo-add-row"
      separator={false}
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      leading={icon ?? <AddCircleIcon />}
    >
      {label}
    </ListRow>
  </ListSection>
);

export default AddActionSection;
