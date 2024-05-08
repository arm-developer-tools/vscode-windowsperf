export enum TreeItemCollapsibleState {
    None = 0,
    Collapsed = 1,
    Expanded = 2
}

export const ThemeIcon = jest.fn();
export const ThemeColor = jest.fn().mockImplementation(id => ({ id }));

export { URI as Uri } from 'vscode-uri';
