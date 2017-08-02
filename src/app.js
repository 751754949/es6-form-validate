import form from './form.js'
import $ from 'jquery';


//错误信息提示重置
form.reset('warn', $.toptip)

//柯里化
var toast = function(type) {
    return function(msg) {
        $.toast(msg, type)
    }
}
// form.reset('warn', toast('forbidden'))

//把默认的'.has-error'重置成'.error'


form.register({
    REG_PASSWORD: /^[A-Z]\w{5,11}$/,
    REG_NUMBER: /^\d+\.\d{2}$/
})

form.reset('errorHandler', ($input)=>{
    $input.closest('.form-group').addClass('has-error')
}) 
var page = {
    validate() {
        form.validate('.valid');
    }
}
export {
    page as page
}
