import type { FC } from 'react';
interface IKeepAliveLayout {
    keepalive: any[];
    keepElements?: any;
    dropByCacheKey?: (path: string) => void;
}
export declare const KeepAliveContext: any;
export declare function useKeepOutlets(): any;
declare const KeepAliveLayout: FC<IKeepAliveLayout>;
export default KeepAliveLayout;
