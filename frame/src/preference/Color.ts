/*
 * @Author: Antoine YANG 
 * @Date: 2019-10-24 17:47:11 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-11-27 19:05:54
 */


const linearGradient: (colorset: Array< string | number >, direction?: 'bottom' | 'top' | 'left' | 'right') => string
    = (colorset: Array< string | number >, direction: 'bottom' | 'top' | 'left' | 'right' = 'bottom') => {
        let steps: Array< [string, number] > = [];
        colorset.forEach((value: string | number) => {
            if (typeof(value) === "number") {
                if (steps.length > 0) {
                    steps[steps.length - 1][1] = value;
                }
            }
            else {
                steps.push([value, -1]);
            }
        });
        if (steps.length === 0) {
            return 'none';
        }
        if (steps.length === 1) {
            return steps[0][0];
        }
        return `linear-gradient(to ${ direction }, ${
            steps.map((value: [string, number], index: number) => {
                if (index === 0) {
                    return value[0];
                }
                else if (index === steps.length - 1) {
                    return ' ' + value[0];
                }
                else if (value[1] === -1) {
                    return ' ' + value[0];
                }
                else {
                    return ' ' + value[0] + ' ' + value[1] * 100 + '%';
                }
            })
        })`;
    };


/**
 * Translates color code or rgb(a) to hsl(a)
 * @param {string} color code input
 */
const toHsl: (color: string) => { code: string; h: number; s: number; l: number; a: number; }
    = (color: string) => {
        let h: number = 0;
        let s: number = 0;
        let l: number = 0;
        let a: number = 1;
        if (color.startsWith('#')) {
            let r: number = 0;
            let g: number = 0;
            let b: number = 0;
            if (color.length === 4) {
                r = 255 * parseInt(color[1], 16) / 16;
                g = 255 * parseInt(color[2], 16) / 16;
                b = 255 * parseInt(color[3], 16) / 16;
                color = `rgb(${ r },${ g },${ b })`;
            }
            else if (color.length === 5) {
                r = 255 * parseInt(color[1], 16) / 16;
                g = 255 * parseInt(color[2], 16) / 16;
                b = 255 * parseInt(color[3], 16) / 16;
                let alpha = 255 * parseInt(color[4], 16);
                color = `rgba(${ r },${ g },${ b },${ alpha })`;
            }
            else if (color.length === 7) {
                r = parseInt(color.substr(1, 2), 16);
                g = parseInt(color.substr(3, 2), 16);
                b = parseInt(color.substr(5, 2), 16);
                color = `rgb(${ r },${ g },${ b })`;
            }
            else if (color.length === 9) {
                r = parseInt(color.substr(1, 2), 16);
                g = parseInt(color.substr(3, 2), 16);
                b = parseInt(color.substr(5, 2), 16);
                let alpha = 255 * parseInt(color[7], 256);
                color = `rgba(${ r },${ g },${ b },${ alpha })`;
            }
        }
        if (color.startsWith('rgb(')) {
            let r: number = 0;
            let g: number = 0;
            let b: number = 0;
            const paths: [ string, string, string ]
                = color.substring(color.indexOf('(') + 1, color.indexOf(')')).split(',') as [string, string, string ];
            r = parseFloat(paths[0]) / 255;
            g = parseFloat(paths[1]) / 255;
            b = parseFloat(paths[2]) / 255;
            let max: number = Math.max(r, g, b);
            let min: number = Math.min(r, g, b);
            h = max === min
                ? 0
                : r === max
                    ? g >= b
                        ? 60 * (g - b) / (max - min)
                        : 60 * (g - b) / (max - min) + 360
                    : g === max
                        ? 60 * (b - r) / (max - min) + 120
                        : 60 * (r - g) / (max - min) + 240;
            l = (max + min) / 2;
            s = l === 0 || max === min ? 0
                : l <= 1 / 2
                    ? (max - min) / (max + min)
                    : (max - min) / (2 - max - min);
            return { code: `hsl(${ h },${ s },${ l })`, h: h, s: s, l: l, a: 1 };
        }
        else if (color.startsWith('rgba(')) {
            let r: number = 0;
            let g: number = 0;
            let b: number = 0;
            const paths: [ string, string, string, string ]
                = color.substring(color.indexOf('(') + 1, color.indexOf(')')).split(',') as [string, string, string, string ];
            r = parseFloat(paths[0]) / 255;
            g = parseFloat(paths[1]) / 255;
            b = parseFloat(paths[2]) / 255;
            a = parseFloat(paths[3]);
            let max: number = Math.max(r, g, b);
            let min: number = Math.min(r, g, b);
            h = max === min
                ? 0
                : r === max
                    ? g >= b
                        ? 60 * (g - b) / (max - min)
                        : 60 * (g - b) / (max - min) + 360
                    : g === max
                        ? 60 * (b - r) / (max - min) + 120
                        : 60 * (r - g) / (max - min) + 240;
            l = (max + min) / 2;
            s = l === 0 || max === min ? 0
                : l <= 1 / 2
                    ? (max - min) / (max + min)
                    : (max - min) / (2 - max - min);
            return { code: `hsla(${ h },${ s },${ l },${ a })`, h: h, s: s, l: l, a: a };
        }
        return { code: 'none', h: h, s: s, l: l, a: a };
    };


const toRgb: (hsl: string) => string
    = (hsl: string) => {
        let params: Array<string> = hsl.substring(hsl.indexOf('(') + 1, hsl.indexOf(')')).split(',');
        if (params.length === 3 || params.length === 4) {
            let h: number = parseFloat(params[0]);
            let s: number = parseFloat(params[1]);
            let l: number = parseFloat(params[2]);
            let q: number = l < 1 / 2 ? l * (1 + s) : l + s - (l * s);
            let p: number = 2 * l - q;
            let h_k: number = h / 360;
            let t_r: number = h_k + 1 / 3;
            t_r = t_r > 1 ? t_r - 1 : t_r < 0 ? t_r + 1 : t_r;
            let t_g: number = h_k;
            t_g = t_g > 1 ? t_g - 1 : t_g < 0 ? t_g + 1 : t_g;
            let t_b: number = h_k - 1 / 3;
            t_b = t_b > 1 ? t_b - 1 : t_b < 0 ? t_b + 1 : t_b;

            let r: number = t_r < 1 / 6
                ? p + (q - p) * 6 * t_r
                : t_r < 1 / 2
                    ? q
                    : t_r < 2 / 3
                        ? p + (q - p) * 6 * (2 / 3 - t_r)
                        : p;
            let g: number = t_g < 1 / 6
                ? p + (q - p) * 6 * t_g
                : t_g < 1 / 2
                    ? q
                    : t_g < 2 / 3
                        ? p + (q - p) * 6 * (2 / 3 - t_g)
                        : p;
            let b: number = t_b < 1 / 6
                ? p + (q - p) * 6 * t_b
                : t_b < 1 / 2
                    ? q
                    : t_b < 2 / 3
                        ? p + (q - p) * 6 * (2 / 3 - t_b)
                        : p;

            if (params.length === 4) {
                return `rgba(${ r * 255 },${ g * 255 },${ b * 255 },${ params[3] })`;
            }
            return `rgb(${ r * 255 },${ g * 255 },${ b * 255 })`;
        }
        return 'none';
    };


/**
 * Sets lightness of a color.
 * @param {string} color
 * @param {number} degree
 * @returns
 */
const setLightness: (color: string, degree: number) => string
    = (color: string, degree: number) => {
        const { h, s, a } = toHsl(color);
        let hsl: string = a === 1 ? `hsl(${ h },${ s },${ degree })` : `hsla(${ h },${ s },${ degree },${ a })`;
        return toRgb(hsl);
    };
    

/**
 * Returns a interpolation between two colors.
 * @param {string} color1
 * @param {string} color2
 * @param {number} step a number between [0, 1]
 * @returns
 */
const interpolate: (color1: string, color2: string, step?: number) => string
    = (color1: string, color2: string, step: number = 0.5) => {
        const hsl1: { code: string; h: number; s: number; l: number; a: number; } = toHsl(color1);
        const hsl2: { code: string; h: number; s: number; l: number; a: number; } = toHsl(color2);
        let h: number = hsl1.h * (1 - step) + hsl2.h * step;
        let s: number = hsl1.s * (1 - step) + hsl2.s * step;
        let l: number = hsl1.l * (1 - step) + hsl2.l * step;
        let a: number = hsl1.a * (1 - step) + hsl2.a * step;
        a = isNaN(a) ? 1 : a;
        let hsl: string = a === 1 ? `hsl(${ h },${ s },${ l })` : `hsla(${ h },${ s },${ l },${ a })`;
        return toRgb(hsl);
    };


/**
 * Color: namespace
 */
const Color = {
    /**Creates a linear gradient.*/
    linearGradient: linearGradient,

    /**Translates a color code to hsl(a).*/
    toHsl: toHsl,
    
    /**Translates a hsl(a) code to rgb(a).*/
    toRgb: toRgb,

    /**Sets lightness of a color.*/
    setLightness: setLightness,
    
    /**Returns a interpolation between two colors.*/
    interpolate: interpolate,

    /**
     * Colorset Nippon
     * Traditional Japanese colors.
     */
    Nippon: {
        list: ['#808F7C', '#51A8DD', '#B54434', '#F0A986', '#F596AA', '#89916B', '#FAD689', '#336774', '#8D742A', '#DC9FB4', '#B28FCE', '#77428D', '#9E7A7A', '#734338', '#BA9132', '#DAC9A6', '#904840', '#6699A1', '#66BAB7', '#4A225D', '#6D2E5B', '#4E4F97', '#D9AB42', '#4B4E2A', '#005CAF', '#574C57', '#0C0C0C', '#0089A7', '#AF5F3C', '#B4A582', '#434343', '#855B32', '#6A4028', '#405B55', '#E87A90', '#113285', '#268785', '#F4A7B9', '#F9BF45', '#A8D8B9', '#62592C', '#EBB471', '#CA7A2C', '#DDA52D', '#D9CD90', '#ADA142', '#B17844', '#42602D', '#0F4C3A', '#947A6D', '#E9CD4C', '#B19693', '#F05E1C', '#305A56', '#91AD70', '#876633', '#33A6B8', '#BC9F77', '#724938', '#261E47', '#08192D', '#7D6C46', '#2D6D4B', '#FFB11B', '#2E5C6E', '#967249', '#F6C555', '#A0674B', '#884C3A', '#26453D', '#B481BB', '#572A3F', '#24936E', '#255359', '#00896C', '#96632E', '#3C2F41', '#9A5034', '#69B0AC', '#FFBA84', '#0093D3', '#5E3D50', '#8E354A', '#E16B8C', '#86473F', '#4D5139', '#7B90D2', '#9B90C2', '#91989F', '#867835', '#376B6D', '#828282', '#F75C2F', '#90B44B', '#8F5A3C', '#CAAD5F', '#7BA23F', '#516E41', '#60373E', '#006284', '#211E55', '#77969A', '#E2943B', '#0D5661', '#78C2C4', '#B07736', '#6E75A4', '#592C63', '#8B81C3', '#FF5E99', '#0B1013', '#FEDFE1', '#C46243', '#A5A051', '#2EA9DF', '#F19483', '#8F77B5', '#A8497A', '#70649A', '#554236', '#646A58', '#724832', '#1C1C1C', '#B9887D', '#4F4F48', '#ED784A', '#86A697', '#81C7D4', '#B5495B', '#563F2E', '#20604F', '#562E37', '#A28C37', '#C1693C', '#FFC408', '#C73E3A', '#AB3B3A', '#B35C37', '#E03C8A', '#FFF10C', '#CC543A', '#CC006B', '#43341B', '#C99833', '#7D532C', '#E8B647', '#854836', '#DCB879', '#86C166', '#838A2D', '#C78550', '#C18A26', '#DB8E71', '#986DB2', '#877F6C', '#E79460', '#91B493', '#A96360', '#FC9F4D', '#B55D4C', '#897D55', '#ECB88A', '#465D4C', '#D75455', '#0F2540', '#707C74', '#5B622E', '#F7D94C', '#080808', '#64363C', '#E9A368', '#BEC23F', '#656765', '#4F726C', '#D19826', '#0C4842', '#58B2DC', '#EB7A77', '#00AA90', '#EFBB24', '#6C6A2D', '#A5DEE4', '#E3916E', '#E98B2A', '#FB966E', '#2B5F75', '#FCFAF2', '#9F353A', '#66327C', '#3A3226', '#6A8372', '#6F3381', '#985F2A', '#373C38', '#E83015', '#3F2B36', '#6E552F', '#D7B98E', '#994639', '#1B813E', '#622954', '#C1328E', '#E1A679', '#607890', '#FB9966', '#577C8A', '#BF6766', '#B1B479', '#78552B', '#DDD23B', '#616138', '#3A8FB7', '#B47157', '#CA7853', '#D7C4BB', '#9B6E23', '#74673E', '#6C6024', '#B5CAA0', '#6A4C9C', '#F7C242', '#FBE251', '#f0dddd', '#52433D', '#227D51', '#F8C3CD', '#D05A6E', '#D0104C', '#1E88A8', '#C7802D', '#7DB9DE', '#F17C67', '#787878', '#DB4D6D', '#4A593D', '#939650', '#BDC0BA', '#EEA9A9', '#CB1B45', '#72636E', '#566C73', '#8A6BBE', '#A36336', '#954A45', '#096148', '#533D5B', '#5DAC81', '#535953', '#787D7B', '#A35E47', '#82663A', '#36563C', '#B68E55', '#FFFFFB', '#0B346E', '#CB4042'],

        /**撫子 rgb(220,159,180)*/
        Nadesiko: '#DC9FB4',
        /**紅梅 rgb(225,107,140)*/
        Koubai: '#E16B8C',
        /**蘇芳 rgb(142,53,74)*/
        Suou: '#8E354A',
        /**退紅 rgb(248,195,205)*/
        Taikou: '#F8C3CD',
        /**一斥染 rgb(244,167,185)*/
        Ikkonzome: '#F4A7B9',
        /**桑染 rgb(100,54,60)*/
        Kuwazome: '#64363C',
        /**桃 rgb(245,150,170)*/
        Momo: '#F596AA',
        /**苺 rgb(181,73,91)*/
        Ichigo: '#B5495B',
        /**薄紅 rgb(232,122,144)*/
        Usubeni: '#E87A90',
        /**今様 rgb(208,90,110)*/
        Imayou: '#D05A6E',
        /**中紅 rgb(219,77,109)*/
        Nakabeni: '#DB4D6D',
        /**桜 rgb(254,223,225)*/
        Sakura: '#FEDFE1',
        /**梅鼠 rgb(158,122,122)*/
        Umenezumi: '#9E7A7A',
        /**韓紅花 rgb(208,16,76)*/
        Karakurenai: '#D0104C',
        /**燕脂 rgb(159,53,58)*/
        Enzi: '#9F353A',
        /**紅 rgb(203,27,69)*/
        Kurenai: '#CB1B45',
        /**鴇 rgb(238,169,169)*/
        Toki: '#EEA9A9',
        /**長春 rgb(191,103,102)*/
        Tyousyunn: '#BF6766',
        /**深緋 rgb(134,71,63)*/
        Kokiake: '#86473F',
        /**桜鼠 rgb(177,150,147)*/
        SakuraNezumi: '#B19693',
        /**甚三紅 rgb(235,122,119)*/
        Zinnzamomi: '#EB7A77',
        /**小豆 rgb(149,74,69)*/
        Azuki: '#954A45',
        /**蘇芳香 rgb(169,99,96)*/
        Suoukou: '#A96360',
        /**赤紅 rgb(203,64,66)*/
        Akabeni: '#CB4042',
        /**真朱 rgb(171,59,58)*/
        Sinnsyu: '#AB3B3A',
        /**灰桜 rgb(215,196,187)*/
        Haizakura: '#D7C4BB',
        /**栗梅 rgb(144,72,64)*/
        Kuriume: '#904840',
        /**海老茶 rgb(115,67,56)*/
        Ebitya: '#734338',
        /**銀朱 rgb(199,62,58)*/
        Ginnsyu: '#C73E3A',
        /**黒鳶 rgb(85,66,54)*/
        Kurotobi: '#554236',
        /**
         */
        /**
         */
        /**
         */
        /**
         */
        /**
         */
        /**
         */
        /**猩猩緋 rgb(232,48,21)*/
        Syozyohi: '#E83015',
        /**
         */
        /**金茶 rgb(199,128,45)*/
        Kinntya: '#C7802D',
        /**
         */
        /**
         */
        /**
         */
        /**
         */
        /**山吹 rgb(255,177,27)*/
        Yamabuki: '#FFB11B',
        /**
         */
        /**
         */
        /**
         */
        /**鳥の子 rgb(218,201,166)*/
        Torinoko: '#DAC9A6',
        /**
         */
        /**
         */
        /**籐黄 rgb(255,196,8)*/
        Touou: '#FFC408',
        /**鬱金 rgb(239,187,36)*/
        Ukonn: '#EFBB24',
        /**
         */
        /**
         */
        /**苗 rgb(134,193,102)*/
        Nae: '#86C166',
        /**
         */
        /**常盤 rgb(27,129,62)*/
        /**
         */
        /**
         */
        /**
         */
        Tokiwa: '#1B813E',
        /**緑 rgb(34,125,81)*/
        Midori: '#227D51',
        /**
         */
        /**
         */
        /**
         */
        /**緑青 rgb(36,147,110)*/
        Rokusyou: '#24936E',
        /**
         */
        /**水浅葱 rgb(102,186,183)*/
        Mizuasagi: '#66BAB7',
        /**青碧 rgb(38,135,133)*/
        Seiheki: '#268785',
        /**
         */
        /**
         */
        /**
         */
        /**
         */
        /**
         */
        /**水 rgb(129,199,212)*/
        Mizu: '#81C7D4',
        /**
         */
        /**
         */
        /**
         */
        /**
         */
        /**黒橡 rgb(11,16,19)*/
        Kuroturubami: '#0B1013',
        /**
         */
        /**褐 rgb(8,25,45)*/
        Kati: '#08192D',
        /**瑠璃 rgb(0,92,175)*/
        Ruri: '#005CAF',
        /**瑠璃紺 rgb(11,52,110)*/
        Rurikonn: '#0B346E',
        /**红碧 rgb(123,144,210)*/
        Berimidori: '#7B90D2',
        /**
         */
        /**
         */
        /**鈍 rgb(101,103,101)*/
        Nibi: '#656765',
        /**青鈍 rgb(83,89,83)*/
        Aonibi: '#535953',
        /**
         */
        /**
         */
        /**
         */
        /**
         */
        /**紫苑 rgb(143,119,181)*/
        Sionn: '#8F77B5',
        /**
         */
        /**
         */
        /**半 rgb(152,109,78)*/
        Hasita: '#986DB2',
        /**
         */
        /**
         */
        /**
         */
        /**
         */
        /**
         */
        /**
         */
        /**
         */
        /**躑躅 rgb(224,60,138)*/
        Tutuzi: '#E03C8A',
        /**胡粉 rgb(189,192,186)*/
        Gohunn: '#FFFFFB',
        /**
         */
        /**
         */
        /**
         */
        /**藍墨茶 rgb(55,60,56)*/
        Aisumitya: '#373C38',
        /**消炭 rgb(67,67,67)*/
        Kesizumi: '#434343',
        /**墨 rgb(28,28,28)*/
        Sumi: '#1C1C1C',
        /**黒 rgb(8,8,8)*/
        Kuro: '#080808',
        /**呂 rgb(12,12,12)*/
        Ro: '#0C0C0C'
    }
}


export default Color;

(window as any)['Color'] = Color;
