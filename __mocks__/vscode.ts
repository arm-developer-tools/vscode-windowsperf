/**
 * Copyright (C) 2024 Arm Limited
 */

import * as VscodeUri from 'vscode-uri';

export enum TreeItemCollapsibleState {
    None = 0,
    Collapsed = 1,
    Expanded = 2
}

export const ThemeIcon = jest.fn().mockImplementation((...args) => args);
export const ThemeColor = jest.fn().mockImplementation((...args) => args);

export class Uri extends VscodeUri.URI {
    public static readonly file = VscodeUri.URI.file;
    public static readonly from = VscodeUri.URI.from;
    public static readonly parse = VscodeUri.URI.parse;
    public static readonly joinPath = VscodeUri.Utils.joinPath;
}

type listenerFn<T> = (e: T) => any;

export class EventEmitter<T> {
    private readonly listeners: listenerFn<T>[] = [];

    event = (listener: listenerFn<T>) => {
        const index = (this.listeners.push(listener) - 1);
        return {
            dispose: () => {
                this.listeners.splice(index, 1);
            }
        };
    };

    fire = (event: T) => {
        this.listeners.forEach(listener => listener(event));
    };

    dispose() {}
}

export const MarkdownString = jest.fn().mockImplementation((...args) => args);

export class CancellationTokenSource {
    private readonly emitter = new EventEmitter<void>();

    token = {
        isCancellationRequested: false,
        onCancellationRequested: this.emitter.event,
    };

    cancel = () => {
        this.token.isCancellationRequested = true;
        this.emitter.fire();
    };

    dispose() {
    }
}

export class Disposable {
    static from(...disposableLikes: { dispose: () => unknown }[]): Disposable {
        return new Disposable(() => {
            disposableLikes.forEach(({ dispose }) => dispose());
        });
    }

    constructor(private readonly toDispose: () => unknown) {}

    dispose() {
        this.toDispose();
    }
}
