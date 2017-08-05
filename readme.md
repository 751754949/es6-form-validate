轻量级表单校验模块（ES6）
====================

## 具备哪些能力  

1. 不约束任何的 HTML Makeup。
2. 只需引入模块无需额外初始化，即可在onchange时对所有绑定`data-rule="规则"`属性的表单元素触发校验。 
3. 除内置的规则（url、email、整数和浮点数等），还允许用户注册新的“规则”（见register方法）。
4. 允许用户重置“错误信息的展示、errorHander、successHander”等行为（通过reset接口见下文），这样设计是为了更灵活的与第三方css组件融合
5. 在submit时，只需手动调用一个方法，并给该方法指定一个“范围”，即可得到校验结果（范围内的所有“输入”是否全都有效）   

总之，要怼谁就给谁加data-rule，要什么样的视图表现由你引入（任意接入现有的css框架）

## 如何运行Demo

```shell
npm install
npm run test
```

浏览器访问：  
http://localhost:3000/build/demo1.html  
http://localhost:3000/build/demo2.html

## 使用方法

```html
<input type="text" name="link" placeholder="链接" data-rule="url" data-help="不能为空" required>
```

```js
import form from './form.js'
import $ from 'jquery';
```

初始化完毕~，以上input在value改变时即可触发内置的`url`格式校验。

## 属性

#### @data-rule <sup>*</sup>

必选项，只有包含data-rule属性的表单元素才会被校验。支持两种写法：

1. data-rule="类型"    
2. data-rule="类型|表达式"   

关于第一种写法，所有内置类型（共7种，见下表）都支持这么写。
关于第二种写法，只有“zh，en，number”3种类型才支持这种写法。表达式中允许出现3个属性：size、decimal、type（后2个只能在number类型的表达式中出现）

```html
<input type="text" name="nickname" data-rule="zh|size:6-8">
<input type="text" name="username" data-rule="eh|size:6-8">       
<input type="text" name="total" data-rule="number|size:6-8,decimal:2-4,type:-1" > 
```

+ szie 后面的值允许使用'-'表示范围（6到8位中文），当然更可以只写一个单纯的数字
+ decimal 是number类型的专属，表示保留几位小数，也可以不写，表示不限制小数
+ type 是number类型的专属，值只能是'+1或-1'，分别表示正负数。也可以不写，

所有类型：

|   类型   | 说明                                                         |
| -------- | ------------------------------------------------------------ |
|   url    | 链接,带不带协议头均可，支持ftp(s)和http(s)                   |
|  regexp  | 正则表达式，把值写在pattern属性上，模块会取这里的值进行校验  |
|  REG_*   | 通过register方法添加自定义的类型                             |
|   email  | 邮箱                                                         |
|   zh     | 中文，支持写法2                                              |
|   en     | 英文，支持写法2                                              |
|  number  | 英文，支持写法2                                              |

特别说明：类型为regexp时，正则表达式需要写在pattern属性上。

```html
<input type="text" name="正则校验" data-rule="regexp" pattern="^\d{1,3}$">
```

#### @data-help

选填项，错误时error wording从这里取。没写data-help则从placeholder取

#### @required

选填项，表示该`input`为必填项，不写则允许空值。比如下例允许空值，但非空时会校验输入值是否有效：
    
```html                     
<input type="text" name="link" placeholder="链接" data-rule="url" data-help="s请输入链接">
```

## 方法

#### @regeister(object) 

注册新的数据规则

```js
import form from './form.js'
import $ from 'jquery';

//添加两种数据格式
form.register({
    REG_PASSWORD: /^[A-Z]\w{5,11}$/,
    REG_NUMBER: /^\d+\.\d{2}$/
})
```

#### @reset(type,slot)

`type` 字符串类型，允许出现warn、errorHandler和successHander。

+ warn表示重置错误信息的展示方式，默认是以alert方式，可以传入第三方的toptip或者toast插件。

```js
 form.reset('warn', $.toptip)

 //或者

 var toast = function(type) {
    return function(msg) {
        $.toast(msg, type)
    }
 }
form.reset('warn', toast('forbidden'))
```

+ errorHander 表示校验返回失败时执行的动作，模块内会默认给重置的slot函数传入$input对象

```js
 form.reset('errorHandler', ($input)=>{
    $input.closest('.form-group').addclass('has-error')
 }) 
```

以上实现了校验失败时，往第一个临近当前input的.form-group元素上添加'has-error'样式。 如果不重置，默认是添加在input上

+ successHandler 表示校验返回成功时执行的动作。用法与errorHandler相同。

注意：errorHandler和successHandler的重置是对称的，不能只重置一个。因为如果只重置errorHanlder（把.has-error挂到.form-group上），success时，默认是从input上移除.has-error的

`slot` 函数类型
  
#### @validate(selector)

`selector` 字符串类型，符合jquery语法的选择器。校验指定选择器内的所有表单元素的输入是否有效，返回true或false

## 参考

[weui.js - form模块](https://github.com/weui/weui.js/blob/master/docs/component/form.md)
