import { css } from '@emotion/css';
import { selectors } from '@grafana/e2e-selectors';
import { ConfigSubSection } from '@grafana/experimental';
import { Button, useTheme2 } from '@grafana/ui';
import React from 'react';

import { ExemplarTraceIdDestination } from '../types';

import { overhaulStyles } from './ConfigEditor';
import ExemplarSetting from './ExemplarSetting';

type Props = {
  options?: ExemplarTraceIdDestination[];
  onChange: (value: ExemplarTraceIdDestination[]) => void;
  disabled?: boolean;
};

export function ExemplarsSettings({ options, onChange, disabled }: Props) {
  const theme = useTheme2();
  // @ts-ignore incompatibility between grafana/data and grafana/ui GrafanaTheme2
  const styles = overhaulStyles(theme);
  return (
    <div className={styles.sectionBottomPadding}>
      <ConfigSubSection title="Exemplars" className={styles.container}>
        {options &&
          options.map((option, index) => {
            return (
              <ExemplarSetting
                key={index}
                value={option}
                onChange={(newField) => {
                  const newOptions = [...options];
                  newOptions.splice(index, 1, newField);
                  onChange(newOptions);
                }}
                onDelete={() => {
                  const newOptions = [...options];
                  newOptions.splice(index, 1);
                  onChange(newOptions);
                }}
                disabled={disabled}
              />
            );
          })}

        {!disabled && (
          <Button
            variant="secondary"
            aria-label={selectors.components.DataSource.Prometheus.configPage.exemplarsAddButton}
            className={css`
              margin-bottom: 10px;
            `}
            icon="plus"
            onClick={(event) => {
              event.preventDefault();
              const newOptions = [...(options || []), { name: 'traceID' }];
              onChange(newOptions);
            }}
          >
            Add
          </Button>
        )}
        {disabled && !options && <i>No exemplars configurations</i>}
      </ConfigSubSection>
    </div>
  );
}
