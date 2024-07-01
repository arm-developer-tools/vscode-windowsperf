/**
 * Copyright (C) 2024 Arm Limited
 */

import '../../webviews/webpack-globals';
import '../style/index.css';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/app';

const api = acquireVsCodeApi();

const containerEl = document.createElement('main');
document.body.appendChild(containerEl);
const root = createRoot(containerEl);

root.render(React.createElement(App, { api }));
