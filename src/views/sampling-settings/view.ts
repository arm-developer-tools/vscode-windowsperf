/**
 * Copyright (C) 2024 Arm Limited
 */

import '../../webviews/webpack-globals';
import './style/index.css';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Root } from './components/root';

const api = acquireVsCodeApi();

const container = document.createElement('main');
document.body.appendChild(container);
const root = createRoot(container);

root.render(React.createElement(Root, { api, container }));
