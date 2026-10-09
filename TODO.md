# TODO

- [x] 将 Workbuddy 所有相关字样替换为 OpenBudy
- [x] 上侧和左侧导航增加支持拖拽窗口
- [x] 参考 [openclaw-mini](/Users/ningjinpeng/Desktop/Git/Github/open/openclaw-mini) 中内容，基于 @earendil-works/pi-ai，给当前项目支持在客户端中配置zhipu智谱apikey，并支持客户端中给ai对话，而不是基于cli。pi-ai实现可以参考[pi](/Users/ningjinpeng/Desktop/Git/Github/open/pi)
- [x] 当在electron运行时，左上角OpenBudy字样会被左上角窗口关闭按钮、最小化按钮等遮挡，可以去掉左上角OpenBudy字样
- [x] 现在界面中有蓝色背景，去掉，只需要适配：浅色、深色主题，并支持跟随系统切换即可
- [] 修改新建任务，从任务底部移动到任务最上方，并且去掉模式选择，直接点击新建任务按钮即直接创建新的任务，不需要弹窗添加自定义名称，首次创建填写默认任务名称，首次在对话窗口发送消息之后，根据对话内容，自动更新生成任务标题。去掉根据任务状态下拉选择。将搜索框和根据任务状态下拉移动端左侧栏右上角，默认只显示icon，减小位置占用
- [x] 不应该由用户手动切换输入框下方的：问一问、做一做、想一想，而是应该由agent决定，去掉手动选择按钮
- [x] 消息列表中，用户发送的内容应该右对齐，模型回复的内容应该左对齐，现在都显示在了左侧
- [x] 修改 deepseek-chat、deepseek v3 模型为 deepseek-flash 和 deepseek-v4-pro
- [x] 使用antd splitter支持调整界面左侧和右侧栏的宽度
- [x] 只有配置智谱api key的tab，没有看到配置deepseek api key的入口，需要添加
- [] agent使用file_write创建文件之后，需要在消息气泡增加按钮，支持打开这个文件或打开文件所在目录
- [] 在设置api key页面中支持直接使用默认浏览器打开相应的provider的官网，不要使用modal弹窗
