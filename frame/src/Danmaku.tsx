/*
 * @Author: Antoine YANG 
 * @Date: 2019-12-25 22:55:48 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-12-26 00:20:55
 */

import React, { Component } from 'react';
import $ from 'jquery';
import { VideoDanmakuInfo } from './InnerType';


interface DanmakuProps {};

interface DanmakuState {
    list: Array<string>;
};

export class Danmaku extends Component<DanmakuProps, DanmakuState, {}> {
    private timeLen: number;
    private handler: Array<NodeJS.Timeout>;
    private list: Array<VideoDanmakuInfo>;

    public constructor(props: DanmakuProps) {
        super(props);
        this.state = {
            list: []
        };
        this.timeLen = 0;
        this.handler = [];
        this.list = [];
    }

    public render(): JSX.Element {
        return (
            <div className="container"
            style={{
                display: 'inline-block',
                height: '40vh',
                width: '40vh',
                padding: '2vh'
            }}>
                <div ref="table"
                style={{
                    width: '38vh',
                    height: '38vh',
                    margin: '0vh',
                    padding: '1vh',
                    fontSize: '13px',
                    overflow: 'hidden'
                }}>
                    {
                        this.state.list.map((item: string, index: number) => {
                            return (
                                <p key={ index } ref={ `item${ index }` } className="DanmakuPiece"
                                style={{
                                    margin: '5px'
                                }}>
                                    {
                                        item
                                    }
                                </p>
                            )
                        })
                    }
                </div>
            </div>
        );
    }

    public componentDidMount(): void {
        this.timeLen = 0;
        this.list.forEach((item: VideoDanmakuInfo) => {
            if (item.beginTime > this.timeLen) {
                this.timeLen = item.beginTime;
            }
        });
    }

    public componentWillUnmount(): void {
        this.handler.forEach((hd: NodeJS.Timeout) => {
            clearTimeout(hd);
        });
    }

    public componentDidUpdate(): void {
        if (this.state.list.length === 0) {
            return;
        }
        const last: JQuery<HTMLElement> = $(this.refs[`item${ this.state.list.length - 1 }`] as any);
        $(".DanmakuPiece").css("transform", "translateY(0)");
        const position: number = last.position().top + last.height()! - $(this.refs["table"]).position().top;
        const height: number = $(this.refs["table"]).height()!;
        for (let i: number = 0; i < this.state.list.length; i++) {
            $(this.refs[`item${ i }`]).css("transform", `translateY(${ height - position }px)`);
        }
    }

    public update(list: Array<VideoDanmakuInfo>): void {
        this.list = list;
        this.handler.forEach((hd: NodeJS.Timeout) => {
            clearTimeout(hd);
        });
        this.handler = [];
        this.timeLen = 0;
        this.list.forEach((item: VideoDanmakuInfo) => {
            if (item.beginTime > this.timeLen) {
                this.timeLen = item.beginTime;
            }
        });
        this.loadIn();
    }

    public loadIn(): void {
        this.list.forEach((item: VideoDanmakuInfo) => {
            this.handler.push(
                setTimeout(() => {
                    let list: Array<string> = [];
                    this.state.list.forEach((str: string, index: number) => {
                        const element: JQuery<HTMLElement> = $(this.refs[`item${ index }`] as any);
                        const position: number = element.position().top + element.height()!
                            - $(this.refs["table"]).position().top;
                        if (position > 0) {
                            list.push(str);
                        }
                    });
                    list.push(item.text);
                    this.setState({
                        list: list
                    });
                }, Math.round(item.beginTime * 60000 / this.timeLen))
            );
        });
    }
}
