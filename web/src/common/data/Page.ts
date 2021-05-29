export class Page<T> {
    public content: T[];
    public totalPages: number;
    public totalElements: number;
    public first: boolean;
    public last: boolean;
}