/**
 * Copyright 2024 Arm Limited
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
