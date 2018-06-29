# node-xlsx

## 项目配置
    npm install 

## 启动项目
    npm run server

## 项目目录
````
- bin 启动目录
  - www 启动文件
 -less 服务器样式目录
- public 开放目录
  - excel 表格目录
  - resource 第三方资源目录
    - js 第三方代码
    - styles 第三方样式
  - styles 服务器样式（less中间件样式编译目录）
  - js 服务器js源文件
- routes 服务器路由
- views 视图目录
````

## 使用方法
把要查找的excel文件放在public/excel目录下，然后用npm run server启动服务（每次更换excel都需要重新启动服务器，否则新文件不会生效）
