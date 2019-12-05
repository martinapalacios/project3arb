import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import LayerDefinition from '../models/LayerDefinition';
import React from 'react';
import Switch from '@material-ui/core/Switch';

export interface Props {
  layerDefs: LayerDefinition[];
  onToggle: (key: string) => void;
}

const LayerToggles: React.FC<Props> = ({ layerDefs, onToggle }) => {
  return (
    <FormGroup>
      {layerDefs.map(({ key, title, isChecked }) => {
        return (
          <FormControlLabel
            key={key}
            control={
              <Switch checked={isChecked} onChange={onToggle.bind(null, key)} />
            }
            label={title}
          />
        );
      })}
    </FormGroup>
  );
};

export default LayerToggles;
