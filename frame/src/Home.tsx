/*
 * @Author: Antoine YANG 
 * @Date: 2019-12-23 20:04:44 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-12-25 19:55:42
 */

import React, { Component } from 'react';
import './App.css';


interface HomeProps {};
interface HomeState {};

export class Home extends Component<HomeProps, HomeState, any> {
    public constructor(props: HomeProps) {
        super(props);
    }

    public render(): JSX.Element {
        return (
            <div>
                HOME
            </div>
        );
    }
}
