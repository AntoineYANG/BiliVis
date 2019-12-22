import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)
sys.path.append('e:\\anaconda\\lib\\site-packages')

from bs4 import BeautifulSoup
import requests


def getUrlForXml(src):
	print('请求视频链接 ' + src + ' ...')
	req_obj = requests.get(src, headers={
		'User-Agent': "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:34.0) Gecko/20100101 Firefox/34.0"
	})
	req_obj.encoding = 'utf-8'
	soup = BeautifulSoup(req_obj.text, 'html.parser')

	playinfo = soup.find_all('script')[2]
	nextUrl = playinfo.string
	nextUrl = nextUrl[nextUrl.find("baseUrl") + 17:]
	nextUrl = 'https://api.bilibili.com/x/v1/dm/list.so?oid=' + nextUrl[:nextUrl.find('"')].split('/')[4]
	print('成功')
	return nextUrl


def saveDanmaku(url, avCode):
	print('提取弹幕记录 ' + url + ' ...')
	req_obj = requests.get(url, headers={
		'User-Agent': "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:34.0) Gecko/20100101 Firefox/34.0"
	})
	req_obj.encoding = 'utf-8'
	soup = BeautifulSoup(req_obj.text, 'html.parser')

	danmakuList = [{
		"timeline": str(d).split(',')[0][6:],
		"time": str(d).split(',')[4],
		"text": d.string
	} for d in soup.find_all('d')]
	print('成功读取  {} 条弹幕'.format(len(danmakuList)))
	with open('./cache/danmaku_av{}.bdm'.format(avCode), mode='w', encoding='utf-8') as cache:
		for d in danmakuList:
			cache.write(d["timeline"] + "," + d["time"] + "," + d["text"] + "\n")
			pass
		print('缓存成功')
		pass
	return


def main(avCode):
	videoUrl = 'https://www.bilibili.com/video/av' + avCode
	danmakuUrl = getUrlForXml(videoUrl)
	saveDanmaku(danmakuUrl, avCode)
	return


if __name__ == '__main__':
	if len(sys.argv) == 1:
		raise KeyError("错误：未指定视频 av 号")
		pass
	else:
		main(sys.argv[1])
		pass
	pass
