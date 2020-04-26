import {InjectionToken} from '@angular/core';
import {environment} from '../../../environments/environment';

const projectId = environment.projectId;

export interface GraphcoolConfig {
  simpleAPI: string;
  subscriptionsAPI: string;
  fileAPI: string;
  fileDownloadURL: string;
}

export const graphcoolConfig: GraphcoolConfig = {
  simpleAPI: `https://api.graph.cool/simple/v1/${projectId}`,
  subscriptionsAPI: `wss://subscriptions.graph.cool/v1/${projectId}`,
  fileAPI: `https://api.graph.cool/file/v1/${projectId}`,
  fileDownloadURL: `https://files.graph.cool/${projectId}`
};

export const GRAPHCOOL_CONFIG = new InjectionToken<GraphcoolConfig>(
  'graphcool.config', {
    providedIn: 'root',
    factory: () => {
      return graphcoolConfig;
    }
  }
);
