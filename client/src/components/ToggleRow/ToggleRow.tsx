import React, { ReactNode, useId } from 'react';
import { ListRow, Toggle } from '@ios27_design_system/react';

export type ToggleRowProps = {
  /** Row title (iOS "Body" text). */
  label: ReactNode;
  /** Optional explanation under the title (iOS "Footnote", secondary label colour). */
  description?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Hairline separator under the row (iOS grouped list). Disable on the last row. */
  separator?: boolean;
};

/**
 * iOS 27 settings row: title (+ optional description) on the left and the
 * native-looking `Toggle` switch of @ios27_design_system/react on the right.
 *
 * The whole text area is tappable and flips the switch, like iOS Settings.
 * The click handler is on the text, not on the row, so the switch <button> is
 * never nested inside another interactive element.
 */
const ToggleRow: React.FC<ToggleRowProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  separator = true,
}) => {
  const labelId = useId();
  const descriptionId = useId();

  const toggle = () => {
    if (!disabled) onChange(!checked);
  };

  return (
    <ListRow
      className={`kdo-toggle-row${disabled ? ' is-disabled' : ''}`}
      separator={separator}
      trailing={
        <Toggle
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          aria-labelledby={labelId}
          aria-describedby={description ? descriptionId : undefined}
        />
      }
    >
      <div className="kdo-toggle-row-text" onClick={toggle}>
        <div id={labelId} className="kdo-toggle-row-label">{label}</div>
        {description && (
          <div id={descriptionId} className="kdo-toggle-row-description text-footnote text-secondary">
            {description}
          </div>
        )}
      </div>
    </ListRow>
  );
};

export default ToggleRow;
