import { AnonymousTrade } from "./AnonymousTrade";
import { SecurityVolume } from "./SecurityVolume";

export class SecurityVolumeWrapper {
    public secCode: string;
    public date: Date;
    public highVolumeTrades: AnonymousTrade[];
    public volumes: SecurityVolume[];
}