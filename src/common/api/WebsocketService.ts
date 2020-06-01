import * as SockJS from 'sockjs-client';
import {interval, Observable, Observer, Subject, SubscriptionLike} from 'rxjs';
import {distinctUntilChanged, filter, map, share, takeWhile} from "rxjs/internal/operators";

const baseUrl = process.env.API_URL + "/echo";

export enum WSEvent {
    TRADING_STRATEGY_STATE = 'TRADING_STRATEGY_STATE',
    LAST_SECURITIES = 'LAST_SECURITIES',
    GET_TRADE_PREMISE_AND_SETUP = 'GET_TRADE_PREMISE_AND_SETUP',
    TRADE_PREMISE = 'TRADE_PREMISE',
    TRADE_SETUP = 'TRADE_SETUP',
    GET_TRADES_AND_ORDERS = 'GET_TRADES_AND_ORDERS',
    TRADES = 'TRADES',
    ACTIVE_TRADES = 'ACTIVE_TRADES',
    ORDERS = 'ORDERS',
    CANCEL_ORDERS = 'CANCEL_ORDERS',
    CREATE_ORDERS = 'CREATE_ORDERS',
    CHANGE_ORDERS = 'CHANGE_ORDERS',
    VOLUMES = 'VOLUMES',
    TERMINATE_POSITION = 'TERMINATE_POSITION',
    REVERSE_POSITION = 'REVERSE_POSITION',
    CANCEL_STOP_ORDERS = 'CANCEL_STOP_ORDERS',
    TREND = 'TREND',
    STACK = 'STACK',
    ALERTS = 'ALERTS',
    GET_MARKET_STATE = 'GET_MARKET_STATE',
    MARKET_STATES = 'MARKET_STATES',
    SWING_STATES = 'SWING_STATES',
    GET_NOTIFICATIONS = 'GET_NOTIFICATIONS',
    NOTIFICATIONS = 'NOTIFICATIONS',
    GET_CANDLES = 'GET_CANDLES',
    CANDLES = 'CANDLES',

    // history
    HISTORY_LAST_SECURITIES = 'HISTORY_LAST_SECURITIES',
    HISTORY_GET_TRADE_PREMISE_AND_SETUP = 'HISTORY_GET_TRADE_PREMISE_AND_SETUP',
    HISTORY_TRADE_PREMISE = 'HISTORY_TRADE_PREMISE',
    HISTORY_TRADE_SETUP = 'HISTORY_TRADE_SETUP',
    HISTORY_GET_TRADES_AND_ORDERS = 'HISTORY_GET_TRADES_AND_ORDERS',
    HISTORY_ORDERS = 'HISTORY_ORDERS',
    HISTORY_CANCEL_ORDERS = 'HISTORY_CANCEL_ORDERS',
    HISTORY_CREATE_ORDERS = 'HISTORY_CREATE_ORDERS',
    HISTORY_CHANGE_ORDERS = 'HISTORY_CHANGE_ORDERS',
    HISTORY_VOLUMES = 'HISTORY_VOLUMES',
    HISTORY_TERMINATE_POSITION = 'HISTORY_TERMINATE_POSITION',
    HISTORY_REVERSE_POSITION = 'HISTORY_REVERSE_POSITION',
    HISTORY_CANCEL_STOP_ORDERS = 'HISTORY_CANCEL_STOP_ORDERS',
    HISTORY_TREND = 'HISTORY_TREND',
    HISTORY_ALERTS = 'HISTORY_ALERTS',
    HISTORY_NOTIFICATIONS = 'HISTORY_NOTIFICATIONS',
    GET_HISTORY_CANDLES = 'GET_HISTORY_CANDLES',
    HISTORY_CANDLES = 'HISTORY_CANDLES',
    HISTORY_MARKET_STATES = 'HISTORY_MARKET_STATES',
    HISTORY_SWING_STATES = 'HISTORY_SWING_STATES',
    HISTORY_TRADING_STRATEGY_STATE = 'HISTORY_TRADING_STRATEGY_STATE'
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

                if (!this.reconnection$ && typeof (isConnected) === 'boolean' && !isConnected) {
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
            this.sock.send(JSON.stringify({event, data}));
        } else {
            console.error('Send error!');
        }
    }

    public connectionStatus(): Observable<boolean> {
        return this.status;
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
