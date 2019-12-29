/*
 * @Author: Antoine YANG 
 * @Date: 2019-12-25 18:53:00 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-12-29 10:55:07
 */

import React, { Component } from 'react';
import $ from 'jquery';
import axios from 'axios';
import { Debounce } from './tools/DebounceFunction';
import { VideoDanmakuInfo } from './InnerType';
import Color from './preference/Color';
import { Danmaku } from './Danmaku';
import { PolylineChart } from './charts/PolylineChart';
import { KeyWordView } from './KeyWordView';


interface VideoViewProps {};
interface VideoViewState {
    list: Array<VideoDanmakuInfo>;
};

export class VideoView extends Component<VideoViewProps, VideoViewState, {}> {
    public constructor(props: VideoViewProps) {
        super(props);
        this.state = {
            list: []
        };
        this.run = new Debounce(() => {
            const url: string = $("#avCodeInput").val() as string;
            if (!url || isNaN(parseInt(url))) {
                return;
            }
            $("#OKbutton").css("background-color", Color.Nippon.Kesizumi);
            (async () => {
                await axios.get(
                    `http://127.0.0.1:2369/video/${ url }`, {
                        headers: {
                            'Content-type': 'application/json;charset=utf-8'
                        }
                    })
                    .then((res: any) => {
                        const _str: string = res.data.data;
                        let data: Array<VideoDanmakuInfo> = [];
                        _str.split("\r\n").forEach((line: string) => {
                            if (line.length) {
                                let datum: Array<string> = line.split(",", 3);
                                if (datum.length >= 3) {
                                    data.push({
                                        beginTime: parseFloat(datum[0]),
                                        date: parseInt(datum[1]),
                                        text: datum.map((str: string, index: number) => {
                                            return index > 1 ? str : "";
                                        }).join("")
                                    });
                                }
                            }
                        });
                        this.setState({
                            list: data
                        });
                        (this.refs["Danmaku"] as Danmaku).update(data);
                        this.updatePolylineChart();
                        $("#OKbutton").css("background-color", "rgb(215, 103, 137)");
                    })
                    .catch((err) => {
                        console.error(err);
                        console.warn("Failed to build connection with back-end server.");
                        $("#OKbutton").css("background-color", "rgb(215, 103, 137)");
                    });
            })();
        });
    }

    public render(): JSX.Element {
        return (
            <>
                <div className="container"
                style={{
                    marginTop: 0
                }}>
                    <p>检索视频</p>
                    <input id="avCodeInput" type="number" maxLength={ 9 } max={ 1e9 } min={ 0 }
                    style={{
                        width: '106px',
                        paddingLeft: '26px'
                    }}/>
                    <label
                    style={{
                        position: 'relative',
                        left: '-129px',
                        fontSize: '16px'
                    }}>
                        av
                    </label>
                    <button id="OKbutton"
                    onClick={
                        () => {
                            this.run.call();
                        }
                    }
                    style={{
                        height: '25.2px',
                        position: 'relative',
                        top: '-0.8px',
                        backgroundColor: 'rgb(215,103,137)',
                        color: 'white',
                        border: 'none'
                    }}>
                        让弹幕飞一会儿吧
                    </button>
                </div>
                <KeyWordView ref="KeyWordView" />
                <div className="container"
                style={{
                    display: 'inline-block',
                    height: '40vh',
                    width: '74vh',
                    padding: '2vh',
                    marginRight: '8vh'
                }}>
                    <PolylineChart ref="PolylineChart" width='74vh' height='40vh'
                    ticksY={
                        (start: number, end: number) => {
                            let spans: Array<number> = [];
                            for (let i: number = start; i < end - Math.floor(Math.floor((end - start) / 5) / 5) * 3;
                            i += Math.floor(Math.floor((end - start) / 5) / 5) * 5) {
                                spans.push(i);
                            }
                            return [...spans, end];
                        }
                    }
                    formatterX={
                        (num: number) => {
                            const hour: number = Math.floor(num / 3600);
                            num -= hour * 3600;
                            const minute: number = Math.floor(num / 60);
                            num -= minute * 60;
                            const second: number = Math.floor(num);
                            return `${ hour >= 10 ? hour : "0" + hour }:${ minute >= 10 ? minute : "0" + minute }`
                                + `:${ second >= 10 ? second : "0" + second }`;
                        }
                    }
                    formatterY={
                        (num: number) => Math.floor(num).toString()
                    }
                    focusLineX={ true } focusLineY = { true }
                    onClick={
                        (event: React.MouseEvent<SVGSVGElement, MouseEvent>, x: number) => {
                            (this.refs["Danmaku"] as Danmaku).loadIn(x);
                        }
                    }
                    process={ true }
                    lineStyle={{
                        stroke: 'rgb(215,103,137)',
                        fill: Color.setLightness('rgb(215,103,137)', 0.8)
                    }}/>
                </div>
                <Danmaku ref="Danmaku" toWordView={
                    (word: string | boolean) => {
                        (this.refs["KeyWordView"] as KeyWordView).cmd(word);
                    }
                } />
                <div className="container"
                style={{
                    height: '30vh',
                    width: '126vh',
                    padding: '2vh'
                }}>
                    <PolylineChart ref="PolylineChart_Date" width='128vh' height='30vh'
                    padding={{ top: 30, right: 30, bottom: 30, left: 40 }}
                    ticksY={
                        (start: number, end: number) => {
                            let spans: Array<number> = [];
                            for (let i: number = start; i < end - Math.floor(Math.floor((end - start) / 5) / 5) * 3;
                            i += Math.floor(Math.floor((end - start) / 5) / 5) * 5) {
                                spans.push(i);
                            }
                            return [...spans, end];
                        }
                    }
                    formatterX={
                        (num: number) => {
                            const date: Date = new Date(num);
                            return `${ date.getFullYear() }-${ date.getMonth() + 1 }-${ date.getDate() }`;
                        }
                    }
                    formatterY={
                        (num: number) => Math.floor(num).toString()
                    }
                    focusLineX={ true } focusLineY = { true }
                    lineStyle={{
                        stroke: 'rgb(215,103,137)',
                        fill: Color.setLightness('rgb(215,103,137)', 0.8)
                    }}/>
                </div>
            </>
        );
    }

    private run: Debounce;

    private updatePolylineChart(): void {
        const lastTime: number = 10;
        const precision: number = 500;
        let pieces: Array<number> = [];
        let dateLine: Array<[number, number]> = [];
        let dateBegin: number = NaN;
        for (let i: number = 0; i < precision; i++) {
            pieces[i] = 0;
        }
        let timeLen = 0;
        this.state.list.forEach((item: VideoDanmakuInfo) => {
            if (item.beginTime > timeLen) {
                timeLen = item.beginTime;
            }
            const date: Date = new Date(item.date * 1000);
            const dateId: number = + new Date(
                `${ date.getFullYear() }-${ date.getMonth() + 1 }-${ date.getDate() } 00:00:00`
            );
            if (isNaN(dateBegin) || dateId < dateBegin) {
                dateBegin = dateId;
            }
        });
        const now: Date = new Date();
        for (let d: number = dateBegin; d <= + new Date(
            `${ now.getFullYear() }-${ now.getMonth() + 1 }-${ now.getDate() } 00:00:00`
        ); d += 86400000) {
            dateLine[dateLine.length] = [d, 0];
        }
        this.state.list.forEach((e: VideoDanmakuInfo) => {
            const startTime: number = Math.floor(e.beginTime / timeLen * precision);
            const endTime: number = Math.floor((e.beginTime + lastTime) / timeLen * precision);
            for (let t: number = startTime; t <= endTime && t < precision; t++) {
                pieces[t]++;
            }
            const date: Date = new Date(e.date * 1000);
            const dateId: number = + new Date(
                `${ date.getFullYear() }-${ date.getMonth() + 1 }-${ date.getDate() } 00:00:00`
            );
            try {
                dateLine[Math.floor((dateId - dateBegin) / 86400000)][1]++;
            } catch (error) {
                console.error(error);
            }
        });
        (this.refs["PolylineChart"] as PolylineChart).setState({
            data: [{
                points: pieces.map((d: number, i: number) => {
                    return [i * timeLen / precision, d]
                })
            }]
        });
        (this.refs["PolylineChart_Date"] as PolylineChart).setState({
            data: [{
                points: dateLine
            }],
            rangeX: [dateBegin, +now]
        });
    }
}
