export interface Portfolio {
    id: number;
    name: string;
    user_id: number;
}

export interface CreatePortfolioRequest {
    name: string;
    user_id: number;
}
