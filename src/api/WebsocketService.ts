import * as SockJS from 'sockjs-client';
import {interval, Observable, Observer, Subject, SubscriptionLike} from 'rxjs';
import {distinctUntilChanged, filter, map, share, takeWhile} from "rxjs/internal/operators";

const baseUrl = process.env.API_URL + "/echo";

export enum WSEvent {
    TRADING_STRATEGY_STATE = 'TRADING_STRATEGY_STATE',
    LAST_SECURITIES = 'LAST_SECURITIES',
    GET_TRADE_PREMISE_AND_SETUP = 'GET_TRADE_PREMISE_AND_SETUP',
    TRADE_PREMISE = 'TRADE_PREMISE',
    TRADE_SETUP = 'TRADE_SETUP'
}

export interface WsMessage<T> {
    event: WSEvent;
    data: T;
}

export class WebsocketService {
    private static instance: WebsocketService;

    public status: Observable<boolean>;

    private websocketSub: SubscriptionLike;
    private statusSub: SubscriptionLike;
    private subjectWS: Subject<WsMessage<any>>;
    private sock: SockJS;
    private connection$: Observer<boolean>;
    private reconnection$: Observable<number>;
    private reconnectInterval: number = 5000;
    private reconnectAttempts: number = 10;
    private isConnected: boolean;

    private constructor() {
        this.subjectWS = new Subject<WsMessage<any>>();

        // connection status
        this.status = new Observable<boolean>((observer) => {
            this.connection$ = observer;
        }).pipe(share(), distinctUntilChanged());

        // run reconnect if not connection
        this.statusSub = this.status
            .subscribe((isConnected) => {
                this.isConnected = isConnected;

                if (!this.reconnection$ && typeof(isConnected) === 'boolean' && !isConnected) {
                    this.reconnect();
                }
            });

        this.websocketSub = this.subjectWS.subscribe(
            null, (error: ErrorEvent) => console.error('WebSocket error!', error)
        );

        this.connect();
    }

    public static getInstance(): WebsocketService {
        if (!WebsocketService.instance) {
            WebsocketService.instance = new WebsocketService();
        }

        return WebsocketService.instance;
    }

    public on<T>(event: WSEvent): Observable<T> {
        if (event) {
            return this.subjectWS.pipe(
                filter((message: WsMessage<T>) => message.event === event),
                map((message: WsMessage<T>) => message.data)
            );
        }
    }

    public send(event: WSEvent, data: any = {}): void {
        if (event && this.isConnected) {
            this.sock.send(JSON.stringify({ event, data }));
        } else {
            console.error('Send error!');
        }
    }

    private connect(): void {
        this.sock = new SockJS(baseUrl);
        this.sock.onopen = () => {
            console.log('WebSocket connected!');
            this.connection$.next(true);
        };

        this.sock.onmessage = (e) => {
            // console.log('message', e.data);
            this.subjectWS.next(JSON.parse(e.data));
        };

        this.sock.onclose = () => {
            console.log('close');
            this.connection$.next(false);
            this.sock = null;
            // run reconnect if errors
            this.reconnect();
        };
    }

    private reconnect(): void {
        this.reconnection$ = interval(this.reconnectInterval)
            .pipe(takeWhile((v, index) => index < this.reconnectAttempts && !this.sock));

        this.reconnection$.subscribe(
            () => this.connect(),
            null,
            () => {
                // Subject complete if reconnect attemts ending
                this.reconnection$ = null;

                if (!this.sock) {
                    this.subjectWS.complete();
                    this.connection$.complete();
                }
            });
    }
}