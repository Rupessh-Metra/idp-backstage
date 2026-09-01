import { useEffect, useState } from 'react';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import type { Entity } from '@backstage/catalog-model';
import { Link, Progress } from '@backstage/core-components';
import { List, ListItem, ListItemText, Typography } from '@material-ui/core';

function entityRoute(entity: Entity): string {
  const namespace = entity.metadata.namespace ?? 'default';
  return `/catalog/${namespace}/${entity.kind.toLowerCase()}/${entity.metadata.name}`;
}

export const OwnedEntities = () => {
  const catalogApi = useApi(catalogApiRef);
  const identityApi = useApi(identityApiRef);
  const [entities, setEntities] = useState<Entity[] | undefined>();

  useEffect(() => {
    let active = true;
    (async () => {
      const identity = await identityApi.getBackstageIdentity();
      const { items } = await catalogApi.getEntities({
        filter: {
          kind: 'Component',
          'relations.ownedBy': identity.ownershipEntityRefs,
        },
      });
      if (active) {
        setEntities(items);
      }
    })();
    return () => {
      active = false;
    };
  }, [catalogApi, identityApi]);

  if (!entities) {
    return <Progress />;
  }

  if (entities.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary">
        You don't own any components yet. Components owned by you or your
        groups will show up here.
      </Typography>
    );
  }

  return (
    <List dense>
      {entities.map(entity => (
        <ListItem key={entity.metadata.uid} divider>
          <ListItemText
            primary={
              <Link to={entityRoute(entity)}>
                {entity.metadata.title ?? entity.metadata.name}
              </Link>
            }
            secondary={entity.metadata.description}
          />
        </ListItem>
      ))}
    </List>
  );
};

export const FeaturedTemplates = () => {
  const catalogApi = useApi(catalogApiRef);
  const [entities, setEntities] = useState<Entity[] | undefined>();

  useEffect(() => {
    let active = true;
    (async () => {
      const { items } = await catalogApi.getEntities({
        filter: { kind: 'Template' },
        limit: 6,
      });
      if (active) {
        setEntities(items);
      }
    })();
    return () => {
      active = false;
    };
  }, [catalogApi]);

  if (!entities) {
    return <Progress />;
  }

  if (entities.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary">
        No templates are registered in the catalog yet.
      </Typography>
    );
  }

  return (
    <List dense>
      {entities.map(entity => (
        <ListItem key={entity.metadata.uid} divider>
          <ListItemText
            primary={
              <Link
                to={`/create/templates/default/${entity.metadata.name}`}
              >
                {entity.metadata.title ?? entity.metadata.name}
              </Link>
            }
            secondary={entity.metadata.description}
          />
        </ListItem>
      ))}
    </List>
  );
};
