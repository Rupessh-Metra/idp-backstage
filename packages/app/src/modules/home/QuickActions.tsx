import { Link } from '@backstage/core-components';
import { makeStyles, Paper, Typography } from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import AppsIcon from '@material-ui/icons/Apps';
import DescriptionIcon from '@material-ui/icons/Description';
import type { ComponentType } from 'react';

const useStyles = makeStyles(theme => ({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing(2),
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
    padding: theme.spacing(2.5),
    textDecoration: 'none',
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
    transition: 'border-color 0.15s ease, transform 0.15s ease',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      transform: 'translateY(-2px)',
    },
  },
  icon: {
    color: theme.palette.primary.main,
    fontSize: 28,
  },
  title: {
    fontWeight: 700,
  },
}));

type Action = {
  title: string;
  description: string;
  to: string;
  Icon: ComponentType<{ className?: string }>;
};

const actions: Action[] = [
  {
    title: 'Create a Service',
    description: 'Scaffold a new project from a template',
    to: '/create',
    Icon: AddCircleOutlineIcon,
  },
  {
    title: 'Browse the Catalog',
    description: 'Find every service, API, and who owns it',
    to: '/catalog',
    Icon: AppsIcon,
  },
  {
    title: 'Read Docs',
    description: 'TechDocs generated from each service repo',
    to: '/docs',
    Icon: DescriptionIcon,
  },
];

export const QuickActions = () => {
  const classes = useStyles();
  return (
    <div className={classes.grid}>
      {actions.map(({ title, description, to, Icon }) => (
        <Link key={to} to={to} style={{ textDecoration: 'none' }}>
          <Paper className={classes.card}>
            <Icon className={classes.icon} />
            <Typography className={classes.title} variant="body1">
              {title}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {description}
            </Typography>
          </Paper>
        </Link>
      ))}
    </div>
  );
};
