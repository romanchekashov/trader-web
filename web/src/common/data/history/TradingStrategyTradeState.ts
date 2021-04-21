export enum TradingStrategyTradeState {
    ENTRY = "ENTRY",
    ENTRY_SUCCESS = "ENTRY_SUCCESS",
    STOP = "STOP",
    STOP_SUCCESS = "STOP_SUCCESS",
    TARGET_1 = "TARGET_1",
    TARGET_1_SUCCESS = "TARGET_1_SUCCESS",
    TARGET_2 = "TARGET_2",
    TARGET_2_SUCCESS = "TARGET_2_SUCCESS",
    KILL = "KILL",
    KILL_EXCEPTION = "KILL_EXCEPTION", // exceptional case if order and stop hit simultaneously
    KILL_SUCCESS = "KILL_SUCCESS",
    FAIL = "FAIL"
}