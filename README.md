# Chrome Rewards Program
---
1. 每天限制指定网址的浏览时间，可自行设置网址和时间上限
2. 每天被分为法定节假日和工作日，两者浏览时间上限不同（默认4小时和2小时）
3. 时间上限存在总时长和单个网页的时长，每日总时长上限保持不变，单个网页时长上限也保持不变
4. 刷新时间为每天的早晨3:00，时间上限不累加
5. 奖励计划：
    - 奖励网页浏览时间达到两小时，当日总时长增加10分钟，每日总时长增加上限为30分钟
    - 刷题奖励（ToDo），随机提供leetcode中等以上算法题，每日仅第一道题通过才获得奖励，时长上限增加20分钟
6. 单个网页浏览时间超过上限，该网页将被屏蔽；指定网页浏览总时长超过上限，指定网页将全部屏蔽
7. 每天可查看自己的网页浏览时长统计，次月1日也将提供上月总结
8. 提供访问密码保护，避免他人误看，统计信息保护（ToDo）
---
每日第一次使用插件时，初始化
跨日则主动记录数据并初始化
从惩罚网址中提取域名信息作为耗时域名保存
从奖励网址中提取域名信息作为增时域名保存
存储所有打开的window的id
考虑标签音频问题(ToDo)

### 自律源于自身，工具仅为辅助
##### 本插件仅自用，不涉及商业范畴，浏览记录是隐私信息，仅供自身查看，不存在信息收集