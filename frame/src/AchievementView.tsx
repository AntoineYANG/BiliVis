/*
 * @Author: Antoine YANG 
 * @Date: 2019-12-29 09:30:47 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-12-29 10:47:15
 */

import React, { Component } from 'react';
import { AchievementViewProps, AchievementViewState } from './InnerType';
import Color from './preference/Color';


export class AchievementView extends Component<AchievementViewProps, AchievementViewState, {}> {
    public constructor(props: AchievementViewProps) {
        super(props);
        this.state = {
            process: {
                kusa: 0,
                tomaranai: 0,
                awsl: 0,
                danmakuumi: 0,
                op: 0
            }
        };
    }

    public render(): JSX.Element {
        return (
            <div className="container"
            style={{
                minHeight: '20vh',
                height: '20vh',
                width: '126vh',
                padding: '1vh 2vh'
            }}>
                {
                    Object.entries(this.state.process).sort((a: [string, number], b: [string, number]) => {
                        return b[1] - a[1];
                    }).slice(0, 3).map((item: [string, number]) => {
                        // if (item[1] === 0) {
                        //     return (<></>);
                        // }
                        return (
                            <p key={ item[0] } ref={ item[0] }
                            style={{
                                margin: '0.5vh 14px 1vh 0px',
                                padding: '0vh 1vh',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: 'white',
                                background: item[1] === 1   ?   Color.Nippon.Toki
                                    : item[1] === 2         ?   Color.Nippon.Mizu
                                    : item[1] === 3         ?   Color.Nippon.Kinntya
                                    : 'rgb(215,103,137)',
                                letterSpacing: `2px`
                            }}>
                                {
                                    item[0] === 'kusa'          ?   "极度生草"
                                    :   item[0] === 'tomaranai' ?   "停不下来"
                                    :   item[0] === 'awsl'      ?   "啊我死了"
                                    :   item[0] === 'danmakuumi'?   "密集弹幕"
                                    :   item[0] === 'op'        ?   "开幕雷击"  :   "undefined"
                                }
                                <span key={ item[0] + "value" }
                                style={{
                                    fontWeight: 'bold',
                                    color: Color.Nippon.Gohunn,
                                    letterSpacing: 'normal'
                                }}>
                                    { " x" + item[1] }
                                </span>
                                <span key={ item[0] + "value" }
                                style={{
                                    fontWeight: 'bold',
                                    color: Color.Nippon.Gohunn,
                                    letterSpacing: 'normal'
                                }}>
                                    {
                                        item[0] === 'kusa'          ?   "弹幕里是一片草原"
                                        :   item[0] === 'tomaranai' ?   "全程无尿点"
                                        :   item[0] === 'awsl'      ?   "阿伟出来死一下"
                                        :   item[0] === 'danmakuumi'?   "手机快要带不动"
                                        :   item[0] === 'op'        ?   "开幕雷击"  :   item[0]
                                    }
                                </span>
                            </p>
                        );
                    })
                }
            </div>
        );
    }
}
