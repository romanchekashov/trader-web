import {Observable, Subject} from 'rxjs';
import {filter, map} from "rxjs/internal/operators";

export enum StackEvent {
    ACTIVE_TRADE_SELECTED = 'ACTIVE_TRADE_SELECTED'
}

export interface StackMessage<T> {
    event: StackEvent
    data: T
}

export class StackService {
    private static instance: StackService
    private subjectWS: Subject<StackMessage<any>>

    private constructor() {
        this.subjectWS = new Subject<StackMessage<any>>()
    }

    public static getInstance(): StackService {
        if (!StackService.instance) {
            StackService.instance = new StackService()
        }

        return StackService.instance
    }

    public on<T>(event: StackEvent): Observable<T> {
        if (event) {
            return this.subjectWS.pipe(
                filter((message: StackMessage<T>) => message.event === event),
                map((message: StackMessage<T>) => message.data)
            )
        }
    }

    public send<T>(event: StackEvent, data?: T): void {
        this.subjectWS.next({
            event,
            data
        })
    }
}