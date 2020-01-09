/*
 * @Author: Antoine YANG 
 * @Date: 2019-12-29 09:30:47 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-12-29 10:47:15
 */

import React, { Component } from 'react';
import { KeyWordViewProps, KeyWordViewState } from './InnerType';
import Color from './preference/Color';


export class KeyWordView extends Component<KeyWordViewProps, KeyWordViewState, {}> {
    public constructor(props: KeyWordViewProps) {
        super(props);
        this.state = {
            words: {}
        };
    }

    public render(): JSX.Element {
        return (
            <div className="container"
            style={{
                minHeight: '4.8vh',
                height: '4.8vh',
                width: '126vh',
                padding: '1vh 2vh',
                overflow: 'hidden',
                wordBreak: 'break-all'
            }}>
                {
                    Object.entries(this.state.words).sort((a: [string, number], b: [string, number]) => {
                        return b[1] - a[1];
                    }).slice(0, Math.min(Object.entries(this.state.words).length, 20)).map((item: [string, number]) => {
                        return (
                            <span key={ item[0] } ref={ item[0] }
                            style={{
                                margin: '0.5vh 14px 1vh 0px',
                                padding: '0vh 1vh',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: 'white',
                                background: item[1] < 10 ? Color.Nippon.Aisumitya
                                : item[1] < 20 ? Color.setLightness(Color.Nippon.Sionn, 0.3)
                                : item[1] < 30 ? Color.Nippon.Midori
                                : item[1] < 50 ? Color.Nippon.Ruri
                                : item[1] < 100 ? Color.Nippon.Kinntya
                                : item[1] < 200 ? Color.Nippon.Hasita
                                : item[1] < 500 ? Color.Nippon.Torinoko
                                : item[1] < 1000 ? Color.Nippon.Akabeni
                                : 'rgb(215,103,137)',
                                letterSpacing: `2px`
                            }}>
                                { item[0] }
                                <span key={ item[0] + "value" }
                                style={{
                                    fontWeight: item[1] >= 10 ? 'bold' : 'normal',
                                    color: Color.Nippon.Gohunn,
                                    letterSpacing: 'normal'
                                }}>
                                    { " x" + item[1] }
                                </span>
                            </span>
                        );
                    })
                }
            </div>
        );
    }

    public cmd(word: string | boolean): void {
        if (word === false || word === true) {
            this.setState({
                words: {}
            });
            return;
        }
        if (word.replace(" ", "").length === 0) {
            return;
        }
        let dict: {[word: string]: number} = this.state.words;
        let insert: boolean = true;
        for (const key in dict) {
            if (dict.hasOwnProperty(key)) {
                if (word.replace(" ", "").toLowerCase() === key.replace(" ", "").toLowerCase()) {
                    dict[key]++;
                    insert = false;
                    break;
                }
            }
        }
        if (insert) {
            dict[word] = 1;
        }
        this.setState({
            words: dict
        });
    }
}
