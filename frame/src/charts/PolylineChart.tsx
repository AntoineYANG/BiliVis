/*
 * @Author: Antoine YANG 
 * @Date: 2019-12-26 12:23:53 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-12-29 09:52:04
 */

import React, { Component } from 'react';
import $ from 'jquery';
import { PolylineChartProps, PolylineChartState, Polyline, Box } from '../InnerType';
import Color from '../preference/Color';


export class PolylineChart extends Component<PolylineChartProps, PolylineChartState, {}> {
    private padding: Box;
    private mounted: boolean;
    private ticksX: (start: number, end: number, state: PolylineChartState) => Array<number>;
    private ticksY: (start: number, end: number, state: PolylineChartState) => Array<number>;
    private formatterX: (value: number) => string;
    private formatterY: (value: number) => string;
    private focusLineX: boolean;
    private focusLineY: boolean;
    private handler: Array<NodeJS.Timeout>;
    private limit: Box = {
        left: NaN,
        right: NaN,
        bottom: NaN,
        top: NaN
    };
    private fx: (x: number) => number;
    private fy: (x: number) => number;
    private process: boolean;

    public constructor(props: PolylineChartProps) {
        super(props);
        this.state = {
            data: []
        };
        this.padding = this.props.padding ? this.props.padding : { top: 30, right: 20, bottom: 30, left: 40 };
        this.mounted = false;
        this.ticksX = this.props.ticksX ? this.props.ticksX : (start: number, end: number, state: PolylineChartState) => {
            let box: Array<number> = [];
            if (state.data.length) {
                state.data.forEach((line: Polyline) => {
                    let index: number = 0;
                    let max = line.points[0][1];
                    for (let i: number = 1; i < line.points.length; i++) {
                        if (line.points[i][1] > max) {
                            max = line.points[i][1];
                            index = i;
                        }
                    }
                    for (let i: number = 0; i <= box.length; i++) {
                        if (i === box.length) {
                            box.push(line.points[index][0]);
                            break;
                        } else if (box[i] === line.points[index][0]) {
                            break;
                        }
                    }
                });
            }
            let ifStart: boolean = true;
            let ifEnd: boolean = true;
            for (let i: number = 0; i < box.length; i++) {
                if (!ifStart && !ifEnd) {
                    break;
                } else if (box[i] === start) {
                    ifStart = false;
                } else if (box[i] === end) {
                    ifEnd = false;
                }
            }
            if (ifStart) {
                box = [start, ...box];
            }
            if (ifEnd) {
                box = [...box, end];
            }
            return box;
        };
        this.ticksY = this.props.ticksY ? this.props.ticksY : (start: number, end: number) => [start, end];
        this.formatterX = this.props.formatterX ? this.props.formatterX : (num: number) => num.toString();
        this.formatterY = this.props.formatterY ? this.props.formatterY : (num: number) => num.toString();
        this.focusLineX = this.props.focusLineX ? this.props.focusLineX : false;
        this.focusLineY = this.props.focusLineY ? this.props.focusLineY : false;
        this.handler = [];
        this.limit = {
            left: this.props.rangeX ? this.props.rangeX[0]
                : this.state.rangeX ? this.state.rangeX[0] : NaN,
            right: this.props.rangeX ? this.props.rangeX[1]
                : this.state.rangeX ? this.state.rangeX[1] : NaN,
            bottom: this.props.rangeY ? this.props.rangeY[0]
                : this.state.rangeY ? this.state.rangeY[0] : NaN,
            top: this.props.rangeY ? this.props.rangeY[1]
                : this.state.rangeY ? this.state.rangeY[1] : NaN
        };
        this.fx = () => NaN;
        this.fy = () => NaN;
        this.process = this.props.process ? this.props.process : false;
    }

    public render(): JSX.Element {
        this.limit = {
            left: this.props.rangeX ? this.props.rangeX[0]
                : this.state.rangeX ? this.state.rangeX[0] : NaN,
            right: this.props.rangeX ? this.props.rangeX[1]
                : this.state.rangeX ? this.state.rangeX[1] : NaN,
            bottom: this.props.rangeY ? this.props.rangeY[0]
                : this.state.rangeY ? this.state.rangeY[0] : NaN,
            top: this.props.rangeY ? this.props.rangeY[1]
                : this.state.rangeY ? this.state.rangeY[1] : NaN
        };
        if ((!this.props.rangeX && !this.state.rangeX) || (!this.props.rangeY && !this.state.rangeY)) {
            this.state.data.forEach((p: Polyline) => {
                p.points.forEach((d: [number, number], i: number) => {
                    if (!this.props.rangeX && !this.state.rangeX) {
                        if (d[0] < this.limit.left || i === 0) {
                            this.limit.left = d[0] < 0 ? d[0] : 0;
                        }
                        if (d[0] > this.limit.right || i === 0) {
                            this.limit.right = d[0];
                        }
                    }
                    if (!this.props.rangeY && !this.state.rangeY) {
                        if (d[1] < this.limit.bottom || i === 0) {
                            this.limit.bottom = d[1] < 0 ? d[0] : 0;
                        }
                        if (d[1] > this.limit.top || i === 0) {
                            this.limit.top = d[1];
                        }
                    }
                });
            });
        }
        if (!this.mounted) {
            return (
                <svg className="PolylineChartSVG" xmlns="http://www.w3.org/2000/svg" id={ this.props.id } ref="svg"
                width={ this.props.width } height={ this.props.height }
                style={{
                    background: 'white',
                    ...this.props.style
                }} />
            );
        }

        this.fx = (x: number) => {
            return this.padding.left + (x - this.limit.left) / (this.limit.right - this.limit.left)
                * ($(this.refs["svg"]).width()! - this.padding.left - this.padding.right);
        };
        this.fy = (y: number) => {
            return this.padding.top + (1 - (y - this.limit.bottom) / (this.limit.top - this.limit.bottom))
                * ($(this.refs["svg"]).height()! - this.padding.top - this.padding.bottom);
        };
        
        return (
            <svg className="PolylineChartSVG" xmlns="http://www.w3.org/2000/svg" id={ this.props.id } ref="svg"
            width={ this.props.width } height={ this.props.height }
            style={{
                background: 'white',
                ...this.props.style
            }}
            onMouseEnter={
                this.focusLineX || this.focusLineY ? () => {
                    if (this.focusLineX) {
                        $(this.refs["Xfocus"]).show();
                        $(this.refs["XfocusTickLabel"]).show();
                    }
                    if (this.focusLineY) {
                        $(this.refs["Yfocus"]).show();
                        $(this.refs["YfocusTickLabel"]).show();
                    }
                } : () => {}
            }
            onMouseLeave={
                this.focusLineX || this.focusLineY ? () => {
                    if (this.focusLineX) {
                        $(this.refs["Xfocus"]).hide();
                        $(this.refs["XfocusTickLabel"]).hide();
                    }
                    if (this.focusLineY) {
                        $(this.refs["Yfocus"]).hide();
                        $(this.refs["YfocusTickLabel"]).hide();
                    }
                } : () => {}
            }
            onMouseMove={
                this.focusLineX || this.focusLineY ? (event: React.MouseEvent<SVGGElement, MouseEvent>) => {
                    const x: number = event.pageX - $(this.refs["svg"]).position().left;
                    const y: number = event.pageY - $(this.refs["svg"]).position().top;
                    
                    if (this.focusLineX && x >= this.padding.left
                            && x <= $(this.refs["svg"]).width()! - this.padding.right) {
                        $(this.refs["Xfocus"]).attr("x1", x).attr("x2", x);
                        $(this.refs["XfocusTickLabel"]).attr("x", x).text(
                            this.formatterX(
                                (x - this.padding.left)
                                / ($(this.refs["svg"]).width()! - this.padding.left - this.padding.right)
                                * (this.limit.right - this.limit.left) + this.limit.left
                            )
                        );
                    }
                    if (this.focusLineY && y >= this.padding.top
                            && y <= $(this.refs["svg"]).height()! - this.padding.bottom) {
                        $(this.refs["Yfocus"]).attr("y1", y).attr("y2", y);
                        $(this.refs["YfocusTickLabel"]).attr("y", y).text(
                            this.formatterY(
                                this.limit.top - (y - this.padding.top - 0.5)
                                / ($(this.refs["svg"]).height()! - this.padding.top - this.padding.bottom)
                                * (this.limit.top - this.limit.bottom)
                            )
                        );
                    }
                } : () => {}
            }
            onClick={
                this.props.onClick ? (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
                    const x: number = event.pageX - $(this.refs["svg"]).position().left;
                    const y: number = event.pageY - $(this.refs["svg"]).position().top;
                    const xValue: number = (x - this.padding.left)
                        / ($(this.refs["svg"]).width()! - this.padding.left - this.padding.right)
                        * (this.limit.right - this.limit.left) + this.limit.left;
                    this.props.onClick!(
                        event,
                        xValue,
                        this.limit.top - (y - this.padding.top - 0.1)
                            / ($(this.refs["svg"]).height()! - this.padding.top - this.padding.bottom)
                            * (this.limit.top - this.limit.bottom)
                    );

                    if (this.process) {
                        // 开始播放
                        this.handler.forEach((hd: NodeJS.Timeout) => {
                            clearTimeout(hd);
                        });
                        this.handler = [];
                        const width: number = this.fx(this.limit.right) - this.fx(0);
                        $(this.refs["progress"]).attr("width", xValue / this.limit.right * width);
                        for (let t: number = Math.round(xValue / this.limit.right * 200) * 300; t <= 60000; t += 300) {
                            this.handler.push(
                                setTimeout(() => {
                                    $(this.refs["progress"]).attr(
                                        "width", width * t / 60000
                                    );
                                }, t - Math.round(xValue / this.limit.right * 200) * 300)
                            );
                        }
                    }
                } : () => {}
            } >
                {
                    // 坐标轴
                    <g className="PolylineChartAxisG" xmlns="http://www.w3.org/2000/svg">
                        {
                            isNaN(this.fx(this.limit.left)) || isNaN(this.fx(this.limit.right))
                            || isNaN(this.fy(this.limit.bottom)) || isNaN(this.fy(this.limit.top))
                            ? null
                            : (
                                <>
                                    {   /* x 轴 */  }
                                    <line className="PolylineChartAxis" xmlns="http://www.w3.org/2000/svg" key={ "Xaxis" }
                                    x1={ this.fx(this.limit.left) } y1={ this.fy(this.limit.bottom) }
                                    x2={ this.fx(this.limit.right) } y2={ this.fy(this.limit.bottom) }
                                    style={{
                                        fill: 'none',
                                        stroke: 'black'
                                    }}/>
                                    {
                                        this.ticksX(this.limit.left, this.limit.right, this.state)
                                        .map((value: number, index: number) => {
                                            return (
                                                <text className="PolylineChartTickLabel" xmlns="http://www.w3.org/2000/svg"
                                                key={ "XtickLabel" + index }
                                                x={ this.fx(value) } y={
                                                    this.padding.top + (
                                                        $(this.refs["svg"]).height()!
                                                        - this.padding.top - this.padding.bottom
                                                    ) + 16
                                                }
                                                textAnchor="middle"
                                                style={{
                                                    fill: 'black',
                                                    fontSize: '12px'
                                                }}>
                                                    {   this.formatterX(value)   }
                                                </text>
                                            );
                                        })
                                    }
                                    {   /* y 轴 */  }
                                    <line className="PolylineChartAxis" xmlns="http://www.w3.org/2000/svg" key={ "Yaxis" }
                                    x1={ this.fx(this.limit.left) } y1={ this.fy(this.limit.bottom) }
                                    x2={ this.fx(this.limit.left) } y2={ this.fy(this.limit.top) }
                                    style={{
                                        fill: 'none',
                                        stroke: 'black'
                                    }}/>
                                    {
                                        this.ticksY(this.limit.bottom, this.limit.top, this.state)
                                        .map((value: number, index: number) => {
                                            return (
                                                <text className="PolylineChartTickLabel" xmlns="http://www.w3.org/2000/svg"
                                                key={ "YtickLabel" + index }
                                                x={
                                                    this.padding.left - 10
                                                } y={ this.fy(value) + 3 }
                                                textAnchor="end"
                                                style={{
                                                    fill: 'black',
                                                    fontSize: '12px'
                                                }}>
                                                    {   this.formatterY(value)   }
                                                </text>
                                            );
                                        })
                                    }
                                    {   /* 基准线刻度 */  }
                                    <>
                                        {   /* x 基准线 */   }
                                        {
                                            this.focusLineX ?
                                            <text className="PolylineChartTickLabel" xmlns="http://www.w3.org/2000/svg"
                                            key={ "XfocusTickLabel" } ref={ "XfocusTickLabel" }
                                            x={ this.fx(0) } y={
                                                this.padding.top + (
                                                    $(this.refs["svg"]).height()!
                                                    - this.padding.top - this.padding.bottom
                                                ) + 16
                                            }
                                            textAnchor="middle"
                                            style={{
                                                fill: Color.Nippon.Tokiwa,
                                                fontSize: '12px',
                                                pointerEvents: 'none'
                                            }}>
                                                {   ""   }
                                            </text> : null
                                        }
                                        {   /* y 基准线 */   }
                                        {
                                            this.focusLineY ?
                                            <text className="PolylineChartTickLabel" xmlns="http://www.w3.org/2000/svg"
                                            key={ "YocusTickLabel" } ref={ "YfocusTickLabel" }
                                            x={
                                                this.padding.left - 10
                                            } y={ this.fy(0) + 3 }
                                            textAnchor="end"
                                            style={{
                                                fill: Color.Nippon.Tokiwa,
                                                fontSize: '12px',
                                                pointerEvents: 'none'
                                            }}>
                                                {   ""   }
                                            </text> : null
                                        }
                                    </>
                                </>
                            )
                        }
                    </g>
                }
                {
                    this.state.data.map((item: Polyline, i: number) => {
                        return (
                            <path className="PolylineChartItem" xmlns="http://www.w3.org/2000/svg" key={ i }
                            d={
                                `M${ this.fx(this.limit.left) },${ this.fy(this.limit.bottom) }`
                                + item.points.map((d: [number, number]) => {
                                    return ` L${ this.fx(d[0]) },${ this.fy(d[1]) }`;
                                }).join("") + ` L${ this.fx(this.limit.right) },${ this.fy(0) }`
                            }
                            style={{
                                fill: 'none',
                                stroke: 'black',
                                ...this.props.lineStyle,
                                ...item.style
                            }}/>
                        );
                    })
                }
                {   /* 进度条 */  }
                {
                    isNaN(this.fx(this.limit.left)) || isNaN(this.fx(this.limit.right))
                    || isNaN(this.fy(this.limit.bottom)) || isNaN(this.fy(this.limit.top))
                    || !this.process
                    ? null
                    : <rect className="PolylineChartProgress" xmlns="http://www.w3.org/2000/svg"
                    key={ "progress" } ref={ "progress" }
                    x={ this.fx(0) } width={ 0 }
                    y={ this.fy(this.limit.top) } height={ this.fy(this.limit.bottom) - this.fy(this.limit.top) }
                    style={{
                        fill: 'rgba(215, 103, 137, 0.2)',
                        stroke: 'none'
                    }}/>
                }
                {
                    isNaN(this.fx(this.limit.left)) || isNaN(this.fx(this.limit.right))
                    || isNaN(this.fy(this.limit.bottom)) || isNaN(this.fy(this.limit.top))
                    ? null
                    : <>
                        {   /* x 基准线 */   }
                        {
                            this.focusLineX ?
                            <line className="PolylineChartFocusX" xmlns="http://www.w3.org/2000/svg"
                            key={ "Xfocus" } ref={ "Xfocus" }
                            x1={ this.fx(0) } y1={ this.fy(this.limit.bottom) }
                            x2={ this.fx(0) } y2={ this.fy(this.limit.top) }
                            style={{
                                fill: 'none',
                                stroke: '#444444',
                                strokeWidth: '0.8px',
                                display: 'none'
                            }}/> : null
                        }
                        {   /* y 基准线 */   }
                        {
                            this.focusLineY ?
                            <line className="PolylineChartFocusY" xmlns="http://www.w3.org/2000/svg"
                            key={ "Yfocus" } ref={ "Yfocus" }
                            x1={ this.fx(this.limit.left) } y1={ this.fy(0) }
                            x2={ this.fx(this.limit.right) } y2={ this.fy(0) }
                            style={{
                                fill: 'none',
                                stroke: '#444444',
                                strokeWidth: '0.8px',
                                display: 'none'
                            }}/> : null
                        }
                    </>
                }
            </svg>
        );
    }

    public componentDidMount(): void {
        this.mounted = true;
        this.forceUpdate();
    }

    public componentDidUpdate(): void {
        this.handler.forEach((hd: NodeJS.Timeout) => {
            clearTimeout(hd);
        });
        this.handler = [];

        const width: number = this.fx(this.limit.right) - this.fx(0);
        for (let t: number = 0; t <= 60000; t += 300) {
            this.handler.push(
                setTimeout(() => {
                    $(this.refs["progress"]).attr("width", width * t / 60000);
                }, t)
            );
        }
    }
}
