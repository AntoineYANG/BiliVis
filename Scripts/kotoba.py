import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)
sys.path.append('e:\\anaconda\\lib\\site-packages')

import jieba
import re


dictionary = {
    "hhh": 0, "www": 0, "233": 0, "awsl": 0, "kksk": 0,
    "锟斤拷": 0, "大小姐": 0
}

stopwords = [
    "应该", "甚至", "但是", "变成", "想到", "知道", "非常", "给", "总", "作为", "以后", "怎么", "并不",
    "并且", "觉得", "十分", "这个", "这些", "这样", "那个", "那些", "那样", "总是", "一直", "后来", "以前",
    "从前", "通过", "起码", "从不", "绝不", "如果", "全是", "因为", "所以", "结果", "还是", "自己", "不要",
    "这里", "哪里", "那里", "时候", "发现", "干什么", "什么", "怎么", "没有", "一边", "一下", "这么", "那么",
    "还好", "怎么办", "为啥", "好像", "似乎", "是不是", "不是", "大概", "可能", "身上", "了解", "最近", "有点",
    "一些", "物品", "居然", "竟然", "然后", "以为", "不管", "不论", "情况", "这种", "那种", "没用", "有些",
    "一点", "一点点", "不怎么", "没多久", "然而", "比较", "好好", "全部", "看到", "真的", "就是", "做个",
    "这是", "那是", "再说", "不行", "不可以", "出现", "时刻", "逐渐", "完全", "拿出", "感觉", "刚刚", "多少",
    "东西"
]


def cut(text):
    text = "hhh".join(
        re.split("[h]*hh", "www".join(
            re.split("[w]*ww", "233".join(
                re.split("2[3]*3", "哈哈哈".join(
                    re.split("哈[哈]*", text)
                ))
            ))
        ))
    )
    for word in dictionary:
        jieba.add_word(word)
    seg = jieba.lcut(text)
    statistics = {}
    li = []
    idx = 0
    while idx < len(seg):
        if idx < len(seg) - 1 and seg[idx + 1].startswith("之"):
            li.append(seg[idx] + seg[idx + 1])
            idx += 1
        else:
            li.append(seg[idx])
        idx += 1
    for word in li:
        if len(word) > 1 and word not in stopwords:
            if word in statistics:
                statistics[word] += 1
            else:
                statistics[word] = 1
        pass

    return statistics


def seperate(avCode):
    print("正在运用分词 ...")
    with open('./cache/danmaku_av{}.bdm'.format(avCode), mode='r', encoding='utf-8') as file:
        with open('./cache/kotoba_av{}.bdm'.format(avCode), mode='w', encoding='utf-8') as output:
            text = []
            for d in file.readlines():
                each = "".join(d[:-1].split(',')[2:]).lower()
                if each.find(" ") != -1:
                    # eg: "开 幕 雷 击"
                    if len(each) - len(each.replace(" ", "")) == len(each.replace(" ", "")) - 1:
                        piece = " ".join(each.replace(" ", ""))
                        if piece in dictionary:
                            dictionary[piece] += 1
                        else:
                            dictionary[piece] = 1
                    # eg: "火 百鬼城 火"
                    elif each.split(" ")[0] == each.split(" ")[-1] \
                            and each[each.find(" ") + 1: each.rfind(" ")].find(" ") == -1:
                        piece = each.split(" ")[0] + " " + each[each.find(" ") + 1: each.rfind(" ")]\
                                + " " + each.split(" ")[-1]
                        if piece in dictionary:
                            dictionary[piece] += 1
                        else:
                            dictionary[piece] = 1
                            dictionary[each[each.find(" ") + 1: each.rfind(" ")]] = 0
                    continue
                text.append(each)
            ts = cut("\n".join(text))
            for t in ts:
                if t in dictionary:
                    dictionary[t] += ts[t]
                else:
                    dictionary[t] = ts[t]
            result = [{"text": word, "value": dictionary[word]} for word in dictionary]
            result.sort(key=lambda item: item["value"], reverse=True)
            for d in result:
                if d["value"] > 1:
                    output.write(d['text'] + "," + str(d['value']) + '\n')
        print("完成")
    return
