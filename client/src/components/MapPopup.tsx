import Box, { BoxProps } from '@material-ui/core/Box';

import Divider from '@material-ui/core/Divider';
import { Feature } from 'geojson';
import Link from '@material-ui/core/Link';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import sortBy from 'lodash.sortby';

export interface Props extends BoxProps {
  features: Feature[];
}

const useStyles = makeStyles(theme => ({
  title: {
    marginTop: 0,
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2), // Leave room for close button
    textTransform: 'uppercase'
  },
  key: {
    flex: '1 0 auto',
    marginRight: theme.spacing(2)
  }
}));

const MapPopup: React.FC<Props> = ({ features, ...other }) => {
  const classes = useStyles();

  const sortedFeatures = sortBy(features, 'properties._title');

  const formatProperties = (properties: any) => {
    const values = [];

    // Build array (`values`) of all property/value pairs to render
    for (const property in properties) {
      const value = properties[property];

      // Ignore any properties starting with "_"
      if (!/^_/.test(property)) {
        values.push({ key: property, value });
      }

      // Add `links` for property keys prefixed with '_link'
      if (/_link.*/.test(property)) {
        values.push({
          link: value,
          linkText: value.split('/').slice(-1)[0] // Text after last '/' in link (file name)
        });
      }
    }

    return values;
  };

  return (
    <Box px={2} {...other}>
      {sortedFeatures.map((feature: any, index: number) => (
        <React.Fragment key={index}>
          <Box pt={2} pb={1}>
            <Typography
              className={classes.title}
              variant="h3"
              color="secondary"
              align="center"
            >
              {feature.properties._title}
            </Typography>
            {formatProperties(feature.properties).map((v, i) => (
              <Box key={i} display="flex" flexDirection="row" my={1}>
                {v.value && (
                  <>
                    <Typography className={classes.key} component="span">
                      {v.key}
                    </Typography>
                    <Typography variant="caption" align="left">
                      {v.value}
                    </Typography>
                  </>
                )}
                {v.link && <Link href={v.link}>{v.linkText}</Link>}
              </Box>
            ))}
          </Box>
          {index < features.length - 1 && <Divider variant="fullWidth" />}
        </React.Fragment>
      ))}
    </Box>
  );
};

export default MapPopup;
