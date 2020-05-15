/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { errorApiRef, useApi } from '@backstage/core';
import { GitType } from 'circleci-api';
import { useContext } from 'react';
import { circleCIApiRef } from '../api/index';
import { AppContext } from '.';
import { useAsyncPolling } from './useAsyncPolling';

const INTERVAL_AMOUNT = 3000;

export function useBuilds() {
  const [{ builds, settings }, dispatch] = useContext(AppContext);

  const api = useApi(circleCIApiRef);
  const errorApi = useApi(errorApiRef);
  // eslint-disable-line no-use-before-define
  const { isPolling, startPolling, stopPolling } = useAsyncPolling(
    () => getBuilds(),
    INTERVAL_AMOUNT,
  );

  const getBuilds = async () => {
    if (settings.owner === '' || settings.repo === '') return;
    try {
      const newBuilds = await api.getBuilds({
        token: settings.token,
        vcs: {
          owner: settings.owner,
          repo: settings.repo,
          type: GitType.GITHUB,
        },
      });
      if (isPolling)
        dispatch({
          type: 'setBuilds',
          payload: newBuilds,
        });
    } catch (e) {
      errorApi.post(e);
    }
  };

  const restartBuild = async (buildId: number) => {
    try {
      await api.retry(buildId, {
        token: settings.token,
        vcs: {
          owner: settings.owner,
          repo: settings.repo,
          type: GitType.GITHUB,
        },
      });
    } catch (e) {
      errorApi.post(e);
    }
  };

  return [
    builds,
    {
      restartBuild,
      startPolling,
      stopPolling,
    },
  ] as const;
}