import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { HomePageWidgetBlueprint } from '@backstage/plugin-home-react/alpha';
import { Hero } from './Hero';
import { QuickActions } from './QuickActions';
import { OwnedEntities, FeaturedTemplates } from './EntityLists';

const heroWidget = HomePageWidgetBlueprint.make({
  name: 'hero',
  params: {
    name: 'PortalHero',
    title: '',
    description: 'What this portal is for',
    components: async () => ({ Content: Hero }),
  },
});

const quickActionsWidget = HomePageWidgetBlueprint.make({
  name: 'quick-actions',
  params: {
    name: 'QuickActions',
    title: 'Quick actions',
    description: 'The things you do most',
    components: async () => ({ Content: QuickActions }),
  },
});

const ownedEntitiesWidget = HomePageWidgetBlueprint.make({
  name: 'owned-entities',
  params: {
    name: 'OwnedEntities',
    title: 'Owned by you',
    description: 'Components you or your groups own',
    components: async () => ({ Content: OwnedEntities }),
  },
});

const featuredTemplatesWidget = HomePageWidgetBlueprint.make({
  name: 'featured-templates',
  params: {
    name: 'FeaturedTemplates',
    title: 'Featured templates',
    description: 'Scaffold a new service from one of these',
    components: async () => ({ Content: FeaturedTemplates }),
  },
});

export const homeModule = createFrontendModule({
  pluginId: 'home',
  extensions: [
    heroWidget,
    quickActionsWidget,
    ownedEntitiesWidget,
    featuredTemplatesWidget,
  ],
});
