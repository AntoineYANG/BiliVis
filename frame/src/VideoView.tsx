/*
 * @Author: Antoine YANG 
 * @Date: 2019-12-25 18:53:00 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-12-26 00:58:26
 */

import React, { Component } from 'react';
import $ from 'jquery';
import axios from 'axios';
import { Debounce } from './tools/DebounceFunction';
import { VideoDanmakuInfo } from './InnerType';
import Color from './preference/Color';
import { Danmaku } from './Danmaku';


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
                        $("#OKbutton").css("background-color", "rgb(215, 103, 137)");
                    })
                    .catch(() => {
                        console.warn("Failed to build connection with back-end server.");
                        $("#OKbutton").css("background-color", "rgb(215, 103, 137)");
                    });
            })();
        });
    }

    public render(): JSX.Element {
        return (
            <>
                <div className="container">
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
                <Danmaku ref="Danmaku" />
            </>
        );
    }

    private run: Debounce;
}
