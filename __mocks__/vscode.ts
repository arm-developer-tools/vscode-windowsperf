export enum TreeItemCollapsibleState {
    None = 0,
    Collapsed = 1,
    Expanded = 2
}

export const ThemeIcon = jest.fn();
export const ThemeColor = jest.fn().mockImplementation(id => ({ id }));

export { URI as Uri } from 'vscode-uri';

type listenerFn<T> = (e: T) => any;

export class EventEmitter<T> {
    private readonly listeners: listenerFn<T>[] = [];

    event = (listener: listenerFn<T>) => {
        this.listeners.push(listener);
        return { dispose: jest.fn() };
    };

    fire = (event: T) => {
        this.listeners.forEach(listener => listener(event));
    };

    dispose() {}
}
