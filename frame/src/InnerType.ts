/*
 * @Author: Antoine YANG 
 * @Date: 2019-12-25 22:15:15 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-12-26 21:06:13
 */


export interface VideoDanmakuInfo {
    beginTime: number;
    date: number;
    text: string;
};

export interface Box {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface PolylineChartProps {
    id?: string;
    width: number | string;
    height: number | string;
    padding?: { top: number, right: number, bottom: number, left: number };
    rangeX?: [number, number];
    rangeY?: [number, number];
    style?: React.CSSProperties;
    lineStyle?: React.CSSProperties;
    ticksX?: (start: number, end: number) => Array<number>;
    ticksY?: (start: number, end: number) => Array<number>;
    formatterX?: (value: number) => string;
    formatterY?: (value: number) => string;
    focusLineX?: boolean;
    focusLineY?: boolean;
    onClick?: (event: React.MouseEvent<SVGSVGElement, MouseEvent>, x: number, y: number) => void;
    process?: boolean;
}

export interface Polyline {
    points: Array<[number, number]>;
    style?: React.CSSProperties;
}

export interface PolylineChartState {
    data: Array<Polyline>;
    rangeX?: [number, number];
    rangeY?: [number, number];
}
