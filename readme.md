

# GBF金本统计

配合gbfApp中金本统计使用的chrome插件，统计超巴、大巴、akx、大公掉落，并存入indexedDB，使数据可以跨域使用。

## 安装方法

1. 下载并解压chrome插件

2. 点击chrome浏览器右上角选项里的**更多工具**—**扩展程序**![image-20220310083651236](https://img.nga.178.com/attachments/mon_202203/10/-zv3miQmh34-b0i1K11T1kSf1-89.png)

3. 打开右上角开发者模式，之后点击左上角加载已解压的扩展程序![image-20220310084540759](https://img.nga.178.com/attachments/mon_202203/10/-zv3miQ1ekg-czrzKcT3cSva-2t.png)

4. 选择解压后的Chrome-Extension-GoldBrickCount文件夹确定后，扩展程序界面出现该插件即表示安装成功。![image-20220310085001355](https://img.nga.178.com/attachments/mon_202203/10/-zv3miQ1ekg-392wKhT1kSbg-63.png)

## 使用说明

1. 插件安装后，每次四大金本结算都会自动收集掉落数据。
   
2. 点击图钉可将插件图标固定在地址栏右侧，图标上的数字代表当前统计的四大金本场次。新启动浏览器不显示数字为正常现象，点击扩展程序中插件的刷新按钮或者进行一次四大金本就会显示数字。![image-20220310085836818](https://img.nga.178.com/attachments/mon_202203/10/-zv3miQbvgg-ew5iKcT1kS98-4g.png)
   
3. 数字底色的绿色代表场次小于等于100，黄色为小于等于200，超出200为红色。因为插件容量的限制，为避免意料之外的数据丢失，建议变为红色后就导入一次数据。
   
4. 将数据导入gbfApp需要保证页面处于[waaatanuki.github.io/gbf-app]()或者[waaatanuki.gitee.io/gbf-app]()，点击图标里的导入按钮即可完成导入。![image-20220310090726469](https://img.nga.178.com/attachments/mon_202203/10/-zv3miQbvvr-coenKdT3cSob-24.png)
   
5. 导入会清空chrome插件中的数据，重新开始记数，整体数据长期保存在gbfApp的indexedDB数据库。之后如果插件需要更新，都建议先把数据导入gbfApp再更新，以免数据丢失。

