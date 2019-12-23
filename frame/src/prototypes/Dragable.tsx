/*
 * @Author: Antoine YANG 
 * @Date: 2019-10-22 09:52:23 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-11-11 13:57:35
 */

import React, { Component } from 'react';
import $ from 'jquery';



export interface DraggerProps {
    left?: [number, number];
    top?: [number, number];
}


/**
 * Makes a component dragable on its title bar.
 * @nb Append 
 ```javascript
    ref="drag:trigger"
 ```
 * to the element you want to apply the dragging feature,
 * and append
 ```javascript
    ref="drag:target"
 ```
 * to the element you want to move.
 * @abstract
 * @class Dragable
 * @extends {Component<P, S, SS>}
 * @template P
 * @template S
 * @template SS
 */
abstract class Dragable<P = {}, S = {}, SS = any> extends Component<P & DraggerProps, S, SS> {
    /**
     * This member is to check if function
     * 
     * componentDidMount()
     * 
     * is NOT overriden.
     * @private
     * @type {NodeJS.Timeout}
     * @memberof Dragable
     */
    private warning: NodeJS.Timeout;

    private static dragging: boolean;
    private static offsetX: number = 0;
    private static offsetY: number = 0;
    
    private left: [number, number];
    private top: [number, number];

    public constructor(props: P & DraggerProps) {
        super(props);
        this.left = this.props.left ? this.props.left as [number, number] : [0, 0];
        this.top = this.props.top ? this.props.top as [number, number] : [0, 0];
        this.warning = setTimeout(() => {
            console.error("Your component extends class Dragable but might override function componentDidMount, which is not allowed.");
        }, 1000);
        Dragable.dragging = false;
    }

    /**
     * This is a void default returning, please override it.
     * @returns {JSX.Element}
     * @memberof Dragable
     */
    public render(): JSX.Element {
        return (
            <></>
        );
    }

    /**
     * WARNING: DO NOT override this function,
     * use
     ```javascript
        public dragableComponentDidMount(): void
     ```
     * instead.
     * 
     * @memberof Dragable
     */
    public componentDidMount(): void {
        if ($(this.refs['drag:trigger'] as any).get().length === 0) {
            console.error("The trigger of this dragging event is not defined.");
        }
        if ($(this.refs['drag:target'] as any).get().length === 0) {
            console.error("The target of this dragging event is not defined.");
        }
        else {
            $(this.refs['drag:trigger'] as any)
                .css('-webkit-user-select', 'none')
                .css('-moz-user-select', 'none')
                .css('-o-user-select', 'none')
                .css('user-select', 'none')
                .attr('ondragstart', 'return false;')
                .on('mousedown', (event: JQuery.MouseDownEvent<any, undefined, any, any>) => {
                    Dragable.dragging = true;
                    Dragable.offsetX = event.clientX - parseInt($(this.refs['drag:target'] as any).css('left')!)
                    Dragable.offsetY = event.clientY - parseInt($(this.refs['drag:target'] as any).css('top')!)
                });
            $(this.refs['drag:target'] as any).css('position', 'absolute')
                .on('mousemove', (event: JQuery.MouseMoveEvent<any, undefined, any, any>) => {
                    if (!Dragable.dragging) {
                        return;
                    }
                    let left: number = event.clientX - Dragable.offsetX;
                    left = left < this.left[0] ? this.left[0] : left > this.left[1] ? this.left[1] : left;
                    let top: number = event.clientY - Dragable.offsetY;
                    top = top < this.top[0] ? this.top[0] : top > this.top[1] ? this.top[1] : top;
                    $(this.refs['drag:target'] as any)
                        .css('left', left + 'px')
                        .css('top', top + 'px');
                });
            $('*').on('mouseup', () => {
                Dragable.dragging = false;
            });
            if (this.left[1] === 0) {
                this.left = [0, 1536 - $(this.refs['drag:target']).outerWidth(true)!];
            }
            if (this.top[1] === 0) {
                this.top = [0, 863.6 - $(this.refs['drag:target']).outerHeight(true)!];
            }
        }
        this.dragableComponentDidMount();
        clearTimeout(this.warning);
    }

    /**
     * This function is to override by the child class,
     * replacing the native react function: componentDidMount().
     * @protected
     * @memberof Dragable
     */
    protected dragableComponentDidMount(): void {
        // do nothing
    }
}


export default Dragable;
