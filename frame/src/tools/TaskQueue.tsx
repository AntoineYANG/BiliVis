/*
 * @Author: Antoine YANG 
 * @Date: 2019-10-02 15:53:12 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-12-02 19:52:08
 */

import React from 'react';
import $ from 'jquery';
import Color from '../preference/Color';
import Dragable from '../prototypes/Dragable';

/**
 * Props of Component TaskQueue.
 * @export
 * @interface TaskQueueProps<T>
 */
export interface TaskQueueProps<T> {
    control: T;
}

/**
 * State of Component TaskQueue.
 * @export
 * @interface TaskQueueState
 */
export interface TaskQueueState {
    log: Array<string>;
}


/**
 * Use queue to manage file getting requests.
 * @class GetRequest
 */
class GetRequest {
    /**
     * Tells if any request is running.
     * @private
     * @static
     * @type {boolean}
     * @memberof GetRequest
     */
    private static occupied: boolean = false;

    /**
     * Queue struct to store unstarted requests.
     * @private
     * @static
     * @type {Array<GetRequest>}
     * @memberof GetRequest
     */
    private static queue: Array<GetRequest> = [];

    /**
     * URL of the file which this request linked at.
     * @readonly
     * @type {string}
     * @memberof GetRequest
     */
    public readonly url: string;

    /**
     * Callback triggered when the request successes.
     * @readonly
     * @private
     * @memberof GetRequest
     */
    private readonly success: (data: any) => void | undefined | null;

    /**
     * Sends information to print.
     * @readonly
     * @private
     * @memberof GetRequest
     */
    private readonly send: (log: string) => void | undefined | null;
    
    /**
     * Tells whether the request is healthy or time-out.
     * @private
     * @memberof GetRequest
     */
    private active: boolean;

    /**
     * Sets a timeout handler to avoid hanging on too long.
     * @private
     * @memberof GetRequest
     */
    private timer: NodeJS.Timeout;

    /**
     * Creates an instance of GetRequest.
     * @param {string} url URL of the file which this request linked at.
     * @param {((data: any) => (void | undefined | null))} success Callback triggered when the request successes.
     * @param {((log: string) => (void | undefined | null))} send Sends information to print.
     * @memberof GetRequest
     */
    public constructor(url: string, success: (data: any) => (void | undefined | null), send: (log: string) => (void | undefined | null)) {
        this.url = url;
        this.success = success;
        this.send = send;
        this.active = true;
        this.timer = setTimeout(() => {}, 0);
        if (!GetRequest.occupied) {
            this.run();
        }
        else {
            GetRequest.queue.push(this);
        }
    }

    /**
     * Activates the file request.
     * @memberof GetRequest
     */
    public run(): void {
        GetRequest.occupied = true;
        this.send(`Start loading file @url${ this.url }:!...`);
        if (this.url.endsWith('.json')) {
            this.timer = setTimeout(() => {
                this.active = false;
                this.send(`@errRunTimeError:! URL: @url${ this.url }:;.`);
                this.send("@r:!");
                this.success(undefined);
                GetRequest.occupied = false;
                GetRequest.next();
            }, 1000);
            $.getJSON(this.url, (data: any) => {
                if (!this.active) {
                    return;
                }
                clearTimeout(this.timer);
                this.send(`@resSuccess:; File @url${ this.url }:! loaded successfully.`);
                this.send("@r:!");
                this.success(data);
                GetRequest.occupied = false;
                GetRequest.next();
            });
        }
        else if (this.url.endsWith('.csv')) {
            this.timer = setTimeout(() => {
                this.active = false;
                this.send(`@errRunTimeError:! URL: @url${ this.url }:;.`);
                this.send("@r:!");
                this.success(undefined);
                GetRequest.occupied = false;
                GetRequest.next();
            }, 1000);
            $.get(this.url, (data: any) => {
                if (!this.active) {
                    return;
                }
                clearTimeout(this.timer);
                if ((data as string).startsWith("<!DOCTYPE html>")) {
                    this.send(`@errFileNotFound:! URL: @url${ this.url }:;.`);
                    this.send("@r:!");
                    this.success(undefined);
                    GetRequest.occupied = false;
                    GetRequest.next();
                    return;
                }
                this.send(`Parsing character stream from @url${ this.url }:! to JavaScript object...`);
                let dataset: Array<{[key: string]: string}> = [];
                let labelset: Array<string> = [];
                try {
                    let arrs: Array<string> = data.split('\r\n');
                    arrs.forEach((arr: string, index: number) => {
                        let info: Array<string> = arr.split(',');
                        if (index === 0) {
                            labelset = info;
                            return;
                        }
                        let d: {[key: string]: string} = {};
                        if (info.length !== labelset.length) {
                            return;
                        }
                        info.forEach((value: string, index: number) => {
                            d[labelset[index]] = value;
                        });
                        dataset.push(d);
                    });
                    this.send(`@resSuccess:; File @url${ this.url }:! loaded successfully.`);
                    this.send("@r:!");
                    this.success(dataset);
                    GetRequest.occupied = false;
                    GetRequest.next();
                } catch (error) {
                    this.active = false;
                    this.send('@errTypeError:!: Failed to parse @url' + this.url + ':;.');
                    this.send("@r:!");
                    this.success(undefined);
                    GetRequest.occupied = false;
                    GetRequest.next();
                    return;
                }
            });
        }
        else {
            this.timer = setTimeout(() => {
                this.active = false;
                this.send(`@errRunTimeError:! URL: @url${ this.url }:!.`);
                this.success(undefined);
                GetRequest.occupied = false;
                GetRequest.next();
            }, 1000);
            $.get(this.url, (data: any) => {
                if (!this.active) {
                    return;
                }
                clearTimeout(this.timer);
                if ((data as string).startsWith("<!DOCTYPE html>")) {
                    this.send(`@errFileNotFound:! URL: @url${ this.url }:;.`);
                    this.send("@r:!");
                    this.success(undefined);
                    GetRequest.occupied = false;
                    GetRequest.next();
                    return;
                }
                this.send(`File @url${ this.url }:! loaded successfully.`);
                this.success(data);
                GetRequest.occupied = false;
                GetRequest.next();
            });
        }
    }

    /**
     * Starts next request in the queue.
     * @private
     * @static
     * @memberof GetRequest
     */
    private static next(): void {
        if (GetRequest.queue.length > 0) {
            let q: Array<GetRequest> = [];
            GetRequest.queue.forEach((req: GetRequest, index: number) => {
                if (index === 0) {
                    req.run();
                }
                else {
                    q.push(req);
                }
            });
            GetRequest.queue = q;
        }
    }
}


/**
 * Provides a visible component as an abstract level beyond file reading requests.
 * Switch it on or off by typing key Q.
 * @class TaskQueue
 * @extends {Dragable<TaskQueueProps<T>, TaskQueueState, {}>} This component is draggable.
 */
class TaskQueue<T = {}> extends Dragable<TaskQueueProps<T>, TaskQueueState, {}> {
    /**
     * Avoids calling the switching too often.
     * @private
     * @type {boolean}
     * @memberof TaskQueue
     */
    private debounce: boolean;

    /**
     * Checks if there's already an instance of TaskQueue object.
     * @private
     * @static
     * @type {boolean}
     * @memberof TaskQueue
     */
    private static instance: boolean = false;


    private readonly control: T;


    /**
     * Checks whether the scroll is activated.
     * @private
     * @type {boolean}
     * @memberof TaskQueue
     */
    private scrolling: boolean = false;


    /**
     * Current offset of the scroll.
     * @private
     * @type {number}
     * @memberof TaskQueue
     */
    private offsetY: number = 0;

    /**
     * The dictionary struct to manage the files.
     * @private
     * @static
     * @type {{ [key: string]: any; }}
     * @memberof TaskQueue
     */
    private static files: { [key: string]: any; } = {};

    /**
     * Creates an instance of TaskQueue.
     * @param {TaskQueueProps} props
     * @memberof TaskQueue
     */
    public constructor(props: TaskQueueProps<T>) {
        super(props);
        this.state = {
            log: []
        };
        this.debounce = false;
        if (TaskQueue.instance) {
            console.error("TaskQueue is constructed more than once, which is not suggested.");
        }
        TaskQueue.instance = true;
        this.control = props.control;
    }

    public render(): JSX.Element {
        return (
            <div id="TaskQueue" ref="drag:target"
            style={{
                width: '600px',
                borderRight: `2px solid ${ Color.Nippon.Kuroturubami }80`,
                borderBottom: `2px solid ${ Color.Nippon.Kuroturubami }80`,
                position: 'absolute',
                left: 0,
                top: 0,
                zIndex: 10000
            }}>
                <div ref="drag:trigger" key="head"
                style={{
                    background: Color.Nippon.Aonibi,
                    width: '100%',
                    fontSize: '16px',
                    textAlign: 'left',
                    color: Color.Nippon.Gohunn
                }}>
                    <header
                    style={{
                        padding: '8px 36px',
                        fontFamily: 'monospace'
                    }} >
                        task queue
                    </header>
                </div>
                <div key="list"
                style={{
                    height: '260px',
                    overflow: 'hidden',
                    background: Color.linearGradient([
                        Color.Nippon.Aisumitya + 'f6',
                        Color.Nippon.Sumi + 'f6',
                        Color.Nippon.Ro + 'f6'
                    ]),
                    fontFamily: 'monospace',
                    color: Color.Nippon.Gohunn,
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: '1.16px',
                    textAlign: 'left',
                    paddingTop: '6px',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    userSelect: 'none'
                }}
                onDragStart={
                    () => false
                } >
                    <div ref="paper" key="left"
                    style={{
                        minHeight: '20px',
                        position: 'relative',
                        top: '0px',
                        wordBreak: 'break-all',
                        display: 'inline-block',
                        width: '580px',
                        marginRight: '-20px'
                    }} >
                        {
                            this.state.log.map((d: string, index: number) => {
                                return (
                                    d === "@r:!"
                                        ? index < this.state.log.length - 1
                                            ?   <br key={ index } ref={ `log_${ index }` }
                                                style={{
                                                    margin: '0px',
                                                    padding: '0% 2%',
                                                    fontSize: '14px',
                                                    lineHeight: '20px'
                                                }} />
                                            :   []
                                        :   <p key={ index } ref={ `log_${ index }` }
                                            style={{
                                                margin: '0px',
                                                padding: '0% 2%',
                                                fontSize: '14px',
                                                lineHeight: '20px',
                                                letterSpacing: '1.16px',
                                                fontFamily: 'monospace'
                                            }} >
                                                { d }
                                            </p>
                                );
                            })
                        }
                        <input key="input" ref="input"
                        style={{
                            margin: '0% 2%',
                            fontSize: '14px',
                            lineHeight: '20px',
                            letterSpacing: '1.16px',
                            fontFamily: 'monospace',
                            display: 'none',
                            width: '556px',
                            border: 'none',
                            color: Color.Nippon.Gohunn,
                            background: Color.Nippon.Kesizumi + '40'
                        }} />
                    </div>
                    <div ref="bar" key="right"
                    style={{
                        float: 'right',
                        height: '256px',
                        padding: '0px 10px'
                    }}
                    onMouseEnter={
                        () => {
                            $(this.refs["handler"])
                                .animate({
                                    opacity: 0.4
                                }, 100);
                        }
                    }
                    onMouseLeave={
                        () => {
                            $(this.refs["handler"])
                                .animate({
                                    opacity: 0.1
                                }, 100);
                        }
                    }
                    onMouseUp={
                        () => {
                            this.scrolling = false;
                        }
                    }
                    onMouseMove={
                        (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                            if (!this.scrolling) {
                                return;
                            }
                            let offset: number = event.clientY - this.offsetY;
                            offset = offset < 0 ? 0 : offset + parseFloat($(this.refs['handler']).css('height')!) > 255
                                ? 255 - parseFloat($(this.refs['handler']).css('height')!) : offset;
                            $(this.refs['handler']).css('top', offset + 'px');
                            $(this.refs["paper"]).css("top", -1 * offset / 255 * ($(this.refs["paper"]).outerHeight()! + 240) + "px");
                        }
                    } >
                        <div ref="handler"
                        style={{
                            width: 17,
                            height: 256,
                            background: Color.Nippon.Gohunn,
                            opacity: 0.1,
                            position: 'relative',
                            top: 0
                        }}
                        onMouseDown={
                            (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                                this.scrolling = true;
                                this.offsetY = event.clientY - parseInt($(this.refs['handler'] as any).css('top')!)
                            }
                        } />
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Adds text preference, and changes the height of the scroll.
     * @memberof TaskQueue
     */
    public componentDidUpdate(): void {
        this.state.log.forEach((text: string, index: number) => {
            let rich: string
            = text.replace("@url", `<span style="color: ${ Color.Nippon.Ukonn }; text-decoration: underline;">`)
                .replace("@err", `<span style="color: ${ Color.Nippon.Syozyohi };">`)
                .replace("@res", `<span style="color: ${ Color.Nippon.Nae };">`)
                .replace(":!", "</span>")
                .replace(":;", "</span>");
            $(this.refs[`log_${ index }`]).html(rich);
        });
        let length: number = 260 / ($(this.refs["paper"]).outerHeight()! + 260) * 256;
        $(this.refs["handler"])
            .css("height", length)
            .css("top", (-255 * parseFloat($(this.refs["paper"]).css("top"))) / ($(this.refs["paper"]).outerHeight()! + 240));
    }

    public dragableComponentDidMount(): void {
        // $(this.refs["drag:target"]).hide();
        $('html').keydown((event: JQuery.KeyDownEvent<HTMLElement, null, HTMLElement, HTMLElement>) => {
            if (this.debounce || $(this.refs["input"]).css("display") !== "none") {
                return;
            }
            this.debounce = true;
            if (event.which === 81) /* Q */ {
                $(this.refs["input"]).hide().val("");
                if ($(this.refs["drag:target"]).css("display") === "none") {
                    $(this.refs["drag:target"])
                        .css('opacity', 0)
                        .show()
                        .animate({
                            opacity: 1,
                            width: 601.6,
                            height: 300.4,
                            top: $(this.refs["drag:target"]).attr('_y'),
                            left: $(this.refs["drag:target"]).attr('_x')
                        }, 200);
                }
                else {
                    $(this.refs["drag:target"])
                        .css('opacity', 1)
                        .attr('_x', $(this.refs["drag:target"]).css('left'))
                        .attr('_y', $(this.refs["drag:target"]).css('top'))
                        .animate({
                            opacity: 0,
                            top: 0,
                            left: 0,
                            width: 0,
                            height: 0
                        }, 200, () => {
                            $(this.refs["drag:target"]).hide();
                        });
                }
            }
        })
        .keyup(() => {
            this.debounce = false;
        })
        .keydown((event: JQuery.KeyDownEvent<HTMLElement, null, HTMLElement, HTMLElement>) => {
            if ($(this.refs["drag:target"]).css("display") === "none") {
                return;
            }
            if (event.which === 38 && $(this.refs["input"]).css("display") === "none") /* up */ {
                let cur: number = parseInt($(this.refs["paper"]).css("top")!) + 3;
                cur = cur > -2 ? -2 : cur;
                $(this.refs["paper"]).css("top", cur + "px");
                $(this.refs["handler"])
                    .css("top", 255 * (-1 * cur) / ($(this.refs["paper"]).outerHeight()! + 240));
            }
            else if (event.which === 40 && $(this.refs["input"]).css("display") === "none") /* down */ {
                let cur: number = parseInt($(this.refs["paper"]).css("top")!) - 3;
                cur = cur < -1 * (($(this.refs["paper"])).outerHeight()! - 15)
                    ? -1 * (($(this.refs["paper"])).outerHeight()! - 15)
                    : cur;
                $(this.refs["paper"]).css("top", cur + "px");
                $(this.refs["handler"])
                    .css("top", 255 * (-1 * cur) / ($(this.refs["paper"]).outerHeight()! + 240));
            }
            else if (event.which === 13) /* enter */ {
                if ($(this.refs["input"]).css("display") === "none") {
                    $(this.refs["input"]).show().focus();
                }
                else {
                    if ((($(this.refs["input"]).val() as any).toString() as string).length > 0) {
                        try {
                            let params: Array<string> = (($(this.refs["input"]).val() as any).toString() as string).split(' ');
                            let request: string = params[0];
                            if (params.length > 0) {
                                this.print(params.join(" "));
                                if (typeof this.control !== 'object') {
                                    return;
                                }
                                const menu: T & {
                                    open: (url: string, success?: ((jsondata: any) => void | null | undefined) | undefined)
                                        => void;
                                    out: (text: string) => void;
                                } = {
                                    ...this.control,
                                    open: this.open.bind(this),
                                    out: this.print.bind(this)
                                };
                                if (params.length > 1 && params[0] === "open") {
                                    if (params.length > 2 && (menu as any).hasOwnProperty(params[2])) {
                                        this.open(params[1], (menu as any)[params[2]] as ((jsondata: any) => void | null | undefined));
                                    }
                                    else {
                                        this.open(params[1], (data: any) => {
                                            console.log(data);
                                        });
                                    }
                                }
                                if (params.length === 1 && params[0] === "clear") {
                                    this.setState({
                                        log: []
                                    });
                                }
                                else {
                                    if ((menu as any).hasOwnProperty(request)) {
                                        let func: any = (menu as any)[request];
                                        if (typeof func === "function") {
                                            let args: Array<any> = [];
                                            for (let i: number = 1; i < params.length; i++) {
                                                args.push(params[i]);
                                            }
                                            try {
                                                this.print(func(...args));
                                            } catch(error) {
                                                // const op: string = "@errRunTimeError: Exception occured when calling "
                                                //     + request + "(" + args.join(",") + "):;";
                                                // this.print(op);
                                            }
                                        }
                                        else {
                                            this.print(func);
                                        }
                                    }
                                    else {
                                        this.print("undefined");
                                    }
                                }
                            }
                        } catch (error) {
                            this.print("@errKeyError:;");
                        }
                    }
                    $(this.refs["input"]).hide().val("");
                }
            }
        });
    }

    /**
     * Parse an object to string.
     * @private
     * @param {any} obj
     * @param {number} left
     * @returns {string}
     * @memberof TaskQueue
     */
    private parse(obj: any, left: number = 0): string {
        let res: string = "";
        if (typeof obj === 'function') {
            res += obj.toString() + "()";
        }
        else if (obj === null) {
            res += "null";
        }
        else if (typeof obj === 'object') {
            res += "{\n" + Object.keys(obj).map((key: any) => {
                let e: string = "";
                for (let i: number = 0; i < left + 1; i++) {
                    e += "&nbsp;&nbsp;";
                }
                e += `${ key }: ` + this.parse(obj[key], 0);
                return e;
            }).join(",\n");
            res += "\n}";
        }
        else if (typeof obj === 'number') {
            res += obj.toString();
        }
        else {
            res += '"' + obj.toString().replace('"', '\\"') + '"';
        }

        return res;
    }

    /**
     * Adds a log.
     * @private
     * @param {any} obj Content of the log.
     * @memberof TaskQueue
     */
    private print(obj: any): void {
        let text: string = typeof obj === 'object' ? this.parse(obj) : obj;
        if (text.length === 0) {
            return;
        }
        let log: Array<string> = this.state.log;
        if (text.includes('\n')) {
            let box: Array<string> = text.split('\n');
            if (box.length > 20) {
                log.push(`Too many lines (${ box.length })`,
                    box[0], box[1], box[2], box[3], box[4], box[5], box[6], box[7], box[8], box[9],
                    "...",
                    box[box.length - 8], box[box.length - 7], box[box.length - 6], box[box.length - 5],
                    box[box.length - 4], box[box.length - 3], box[box.length - 2], box[box.length - 1]);
            }
            else {
                log.push(...box);
            }
        }
        else {
            log.push(text);
        }
        this.setState({
            log: log
        });
        if (($(this.refs["paper"])).outerHeight()! > 260) {
            let cur: number = -1 * (($(this.refs["paper"])).outerHeight()! - 260);
            if (parseFloat($(this.refs["paper"]).css("top")!) > cur) {
                $(this.refs["paper"]).css("top", cur + "px");
            }
        }
    }

    /**
     * Opens a file.
     * This object will bind an "open" attribute which is a reference of this function on object window.
     * @param {string} url The path of the file.
     * @param {((jsondata: any) => void | undefined | null)} [success] Callback called when the request successes.
     * @param {(() => void | undefined | null)} [fail] Callback called when the request fails.
     * @returns {void}
     * @memberof TaskQueue
     */
    public open(url: string, success?: (jsondata: any) => void | undefined | null, fail?: () => void | undefined | null): void {
        if (TaskQueue.files[url] === "REQUEST_NOW_WAITING_IN_THE_QUEUE") {
            return;
        }
        else if (TaskQueue.files[url] !== undefined) {
            this.print(`@resSuccess:; Data from file @url${ url }:! already loaded.`);
            if (success && TaskQueue.files[url]) {
                success(TaskQueue.files[url]);
            }
            return;
        }
        else {
            TaskQueue.files[url] = "REQUEST_NOW_WAITING_IN_THE_QUEUE";
            new GetRequest(url, (data: any) => {
                TaskQueue.files[url] = data;
                if (success && data) {
                    success(data);
                }
            }, (log: string) => {
                this.print(log);
                if (fail && log.startsWith('@err')) {
                    fail();
                }
            });
            return;
        }
    }

    /**
     * Sets the visibility of this DOM element.
     * @param {('on' | 'off' | number)} args
     * * on visible
     * * off hidden
     * * number shows the DOM element and hides it after certain time
     * @memberof TaskQueue
     */
    public display(args: 'on' | 'off' | number): void {
        switch (args) {
            case 'on':
                $(this.refs["drag:target"])
                    .css('opacity', 0)
                    .show()
                    .animate({
                        opacity: 1,
                        width: 601.6,
                        height: 300.4,
                        top: $(this.refs["drag:target"]).attr('_y'),
                        left: $(this.refs["drag:target"]).attr('_x')
                    }, 200);
                return;
            case 'off':
                $(this.refs["drag:target"])
                    .css('opacity', 1)
                    .attr('_x', $(this.refs["drag:target"]).css('left'))
                    .attr('_y', $(this.refs["drag:target"]).css('top'))
                    .animate({
                        opacity: 0,
                        top: 0,
                        left: 0,
                        width: 0,
                        height: 0
                    }, 200, () => {
                        $(this.refs["drag:target"]).hide();
                    });
                return;
        }

        $(this.refs["drag:target"])
            .css('opacity', 0)
            .show()
            .animate({
                opacity: 1,
                width: 601.6,
                height: 300.4,
                top: $(this.refs["drag:target"]).attr('_y'),
                left: $(this.refs["drag:target"]).attr('_x')
            }, 200);
        setTimeout(() => {
            $(this.refs["drag:target"])
                .css('opacity', 1)
                .attr('_x', $(this.refs["drag:target"]).css('left'))
                .attr('_y', $(this.refs["drag:target"]).css('top'))
                .animate({
                    opacity: 0,
                    top: 0,
                    left: 0,
                    width: 0,
                    height: 0
                }, 200, () => {
                    $(this.refs["drag:target"]).hide();
                });
        }, args);
    }
}


export default TaskQueue;
