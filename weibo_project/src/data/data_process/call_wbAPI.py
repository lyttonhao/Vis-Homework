from weibo import APIClient

APP_KEY = '719436903' # app key
APP_SECRET = 'f33654f12e4730fb3bc4fb23577e4ba2'
CALLBACK_URL = 'http://www.example.com/callback' # callback url

client = APIClient(app_key=APP_KEY, app_secret=APP_SECRET, redirect_uri=CALLBACK_URL)
url = client.get_authorize_url()
# TODO: redirect to url

# 获取URL参数code:
code = your.web.framework.request.get('code')
client = APIClient(app_key=APP_KEY, app_secret=APP_SECRET, redirect_uri=CALLBACK_URL)
r = client.request_access_token(code)
access_token = r.access_token # 新浪返回的token，类似abc123xyz456
expires_in = r.expires_in # token过期的UNIX时间：http://zh.wikipedia.org/wiki/UNIX%E6%97%B6%E9%97%B4
# TODO: 在此可保存access token
client.set_access_token(access_token, expires_in)

print client.statuses.user_timeline.get()
print client.statuses.update.post(status=u'测试OAuth 2.0发微博')
print client.statuses.upload.post(status=u'测试OAuth 2.0带图片发微博', pic=open('/Users/michael/test.png'))