# CircleCI Plugin

Website: [https://circleci.com/](https://circleci.com/)

<img src="./src/assets/screenshot-1.png" />
<img src="./src/assets/screenshot-2.png" />

## Setup

1. If you have standalone app (you didn't clone this repo), then do

```bash
yarn add @backstage/plugin-circleci
```

2. Add plugin itself:

```js
// packages/app/src/plugins.ts
export { plugin as Circleci } from '@backstage/plugin-circleci';
```

3. Register the plugin router:

```jsx
// packages/app/src/components/catalog/EntityPage.tsx

import { Router as CircleCIRouter } from '@backstage/plugin-circleci';

// Then somewhere inside <EntityPageLayout>
<EntityPageLayout.Content
  path="/ci-cd/*"
  title="CI/CD"
  element={<CircleCIRouter />}
/>;
```

4. Add proxy config:

```yaml
// app-config.yaml
proxy:
  '/circleci/api':
    target: https://circleci.com/api/v1.1
    headers:
      Circle-Token:
        $env: CIRCLECI_AUTH_TOKEN
```

5. Get and provide `CIRCLECI_AUTH_TOKEN` as env variable (https://circleci.com/docs/api/#add-an-api-token)
6. Add `circleci.com/project-slug` annotation to your catalog-info.yaml file in format <git-provider>/<owner>/<project> (https://backstage.io/docs/architecture-decisions/adrs-adr002#format)

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  # ...
  annotations:
    # This also supports bitbucket/xxx/yyy
    circleci.com/project-slug: github/my-org/my-repo
spec:
  type: service
  # ...
```

## Features

- List top 50 builds for a project
- Dive into one build to see logs
- Polling (logs only)
- Retry builds
- Works for both project and personal tokens
- Pagination for builds

## Limitations

- CircleCI has pretty strict rate limits per token, be careful with opened tabs
- CircleCI doesn't provide a way to auth by 3rd party (e.g. GitHub) token, nor by calling their OAuth endpoints, which currently stands in the way of better auth integration with Backstage (https://discuss.circleci.com/t/circleci-api-authorization-with-github-token/5356)
