//引入模块，即初始化完毕（赋予input在onchange时校验的能力）
import $ from 'jquery';
import form from './form.js'

form.register({
    REG_PASSWORD: /^[A-Z]\w{5,11}$/, //首字母大写的密码(6-12)
})

//reset接口支持errorHander和successHander的重置
//注意：2个要同时重置，原因见文档

form.reset('errorHandler', ($input)=>{
    $input.closest('.weui-cell').addClass('weui-cell_warn').removeClass('weui-cell_success')
}) 

form.reset('successHandler', ($input)=>{
    $input.closest('.weui-cell').addClass('weui-cell_success').removeClass('weui-cell_warn')
})

//默认是以alert方式提示错误信息，
//重置成jqweui的toptip
form.reset('warn', $.toptip)

//还可以这样
//柯里化
// var toast = function(type) {
//     return function(msg) {
//         $.toast(msg, type)
//     }
// }
// form.reset('warn', toast('forbidden'))

var page = {
    validate() {
        form.validate('body');
    }
}
export {
    page as page
}