/*
 * @Author: Antoine YANG 
 * @Date: 2019-12-25 20:38:11 
 * @Last Modified by:   Antoine YANG 
 * @Last Modified time: 2019-12-25 20:38:11 
 */

export class Debounce {
    private body: Function;
    private timespan: number;
    private active: boolean;

    public constructor(body: Function, timespan: number = 500) {
        this.body = body;
        this.timespan = timespan;
        this.active = true;
    }

    public call(...args: any): boolean {
        if (this.active) {
            this.active = false;
            this.body(args);
            setTimeout(() => {
                this.active = true;
            }, this.timespan);
            return true;
        }
        return false;
    }
}
