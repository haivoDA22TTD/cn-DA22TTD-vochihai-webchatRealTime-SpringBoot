export interface User {
    username?: string,
    passsword?: string,
    status?: Status,
    avatarUrl?: string
}

export enum Status{
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE'
}
