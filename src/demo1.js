//引入模块，即初始化完毕（赋予input在onchange时校验的能力）
import $ from 'jquery';
import form from './form.js'

form.register({
    REG_PASSWORD: /^[A-Z]\w{5,11}$/, //首字母大写的密码(6-12)
})


var page = {
    validate() {
        form.validate('body');
    }
}
export {
    page as page
}