import $ from 'jquery';
/**
 *
 * 用法设计
 *
 * ```html
 *   <input type="text" name="link" placeholder="链接" data-rule="url" data-help="不能为空" required>
 * ```
 *
 *
 * @data-rule 表示该input应输入的值类型,有两种写法
 * 1. data-rule="类型"
 * - url
 * - email
 * - zh
 * - en
 * - regexp 当设置该类型时，必须跟上pattern属性，值为正则表达式
 * - REG_* 通过register方法注册的自定义类型
 *
 * 2. data-rule="类型|表达式"
 *    表达式只会出现3种属性：size、decimal、type（后两者只用于描述number类型）
 * - "en|size:3" 表示只能输入3位英文
 * - "zh|size:3-10" 表示允许输入3到10位的中文
 * - "number|size:3-10,type:'+1',decimal:2"
 *   + type 表示正数(+1)，负数(-1)，没有type表示正负数以及0
 *   + decimal 表示小数点保留几位，没有decimal表示整数
 *   + size 表示位数，没有表示不限位数
 * - "select|size:1-3" 表示允许选中几个，一般用于checkbox的第一个
 *
 * @data-help 报错的wording会从 data-help | placeholder 里获得
 *
 *
 * @required  选填属性。不加该属性表示该项允许空值（即非必填）
 */
let defaults = {
    //支持完整(http://www.a.com)的或者不带协议(www.a.com)的url
    //并且协议只认http(s)和ftp(s)    
    url: /^((f|ht){1}(tp|tps):\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\?%&=]*)?/,
    //@左边只允许数字、字母、'.'和'_'
    //@右边允许出现@sina.com.cn这样的格式
    email: /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/,
    //纯中文
    zh: /^[\u4e00-\u9fa5]+$/,
    //纯英文
    en: /^[a-zA-Z]+$/,
    //纯数字，支持正负数，浮点数，以及"1,300,268"这样的写法
    number: /^-?\d+(\.\d+)?$/,
    //不包含`,~,!,@,#,$,%,^,&,*,(,),+,<,>,?,:,",{,},\,/,;,',[,]的任意字符 
    // word: /[`~!@#\$%\^\&\*\(\)\+<>\?:"\{\}\\\/;'\[\]]/im, 
    regexp: '',
    select: ''
};
let successClass = 'has-success';
let errorClass = 'has-error';
let patterns = defaults;
/**
 * 展示错误信息
 * @param  {String}   msg    [错误信息]
 * @param  {Function} theWay [默认以alert方式，可以通过暴露的reset接口重置]
 * @return {[type]}          [展示错误信息]
 */
let _warn = function(msg, say = alert) {
    say(msg)
};
let _errorHandler = function($input) {
    $input.addClass(errorClass).removeClass(successClass);
};
let _successHandler = function($input) {
    $input.removeClass(errorClass).addClass(successClass);
};
/**
 * 校验input
 * @param  {Object} $input [jq对象]
 * @return {Boolean}       [true校验通过，false校验失败]
 */
let _checkIt = function($input) {
    //1、'data-rule'值为空，不校验
    //2、'data-rule'值为'regxp'，但'pattern'为空，不校验
    //3、 必填项为空值时，直接提示（不再进行parseRule）
    //4、非比填项允许为空值
    //5、data-rule和input value都不为空时，不管有没required都得校验
    if (!$input.data('rule') || ($input.data('rule') == 'regexp' && !$input.prop('pattern'))) {
        return false
    } else if (!$input.val() && $input.prop('required')) {
        return false
    } else if (!$input.val() && !$input.prop('required')) {
        return true
    } else if ($input.val()) {
        let regxp = _parseRule($input);
        return regxp.test($input.val()) ? true : false;
    }
};
/**
 * 解析data-rule
 * @param  {Object} $input [jq对象]
 * @return {Object}        [返回一个正则表达式对象（如果是'select|3-10'类型的会返回位数）]
 */
let _parseRule = function($input) {
    let rule = $input.data('rule').trim().toLowerCase();
    let type = rule.match(/^(\w+)(\|[\w|\W]+)?/)[1];
    let pattern;
    //判断type是否存在 》属于哪种rule类型 》对第二种类型进一步分类解析
    if (!patterns.hasOwnProperty(type)) {
        throw type + ' is not registered'
    } else if (/^\w+$/.test(rule)) {
        if (type == 'regexp') {
            pattern = new RegExp($input.prop('pattern'));
        } else {
            pattern = patterns[type];
        }
    } else if (/^\w+\|[\w|\W]+/.test(rule)) {
        // 'size:1-10,decimal:1-2,type:+1'            
        let exp = rule.slice(type.length + 1); //需要扣除掉'|''
        let obj = {};
        exp.split(',').forEach((item) => {
            obj[item.split(':')[0]] = item.split(':')[1]
        })
        if (type == 'number') {
            if (obj['size'] && !obj.hasOwnProperty('decimal') && !obj.hasOwnProperty('type')) {
                // /^-?\d{1,3}$/  限定位数的整数
                pattern = new RegExp('^-?\\d{' + obj['size'].replace('-', ',') + '}$');
            } else if (obj['size'] && obj['type'] == '+1' && !obj.hasOwnProperty('decimal')) {
                // /^\d{1,3}$/  限定位数的正整数
                pattern = new RegExp('^\\d{' + obj['size'].replace('-', ',') + '}$');
            } else if (obj['size'] && obj['type'] == '-1' && !obj.hasOwnProperty('decimal')) {
                // /^-\d{1,3}$/  限定位数的负整数
                pattern = new RegExp('^-\\d{' + obj['size'].replace('-', ',') + '}$');
            } else if (obj['type'] == '+1' && !obj.hasOwnProperty('size') && !obj.hasOwnProperty('decimal')) {
                // /^\d+$/  不限定位数的正整数
                pattern = new RegExp('^\\d+$');
            } else if (obj['type'] == '-1' && !obj.hasOwnProperty('size') && !obj.hasOwnProperty('decimal')) {
                // /^-\d+$/  不限定位数的负整数
                pattern = new RegExp('^-\\d+$');
            } else if (obj['decimal'] && !obj.hasOwnProperty('size') && !obj.hasOwnProperty('type')) {
                // /^-?\d+\.\d{1,3}$/  浮点数（正负均可），只定小数点的
                pattern = new RegExp('^-?\\d+\\.\\d{' + obj['decimal'].replace('-', ',') + '}$');
            } else if (!obj.hasOwnProperty('size') && obj['type'] == '+1' && obj['decimal']) {
                // /^\d+\.\d{1,3}$/  正浮点数，只定小数点的
                pattern = new RegExp('^\\d+\\.\\d{' + obj['decimal'].replace('-', ',') + '}$');
            } else if (!obj.hasOwnProperty('size') && obj['type'] == '-1' && obj['decimal']) {
                // /^-\d+\.\d{1,3}$/  负浮点数，只定小数点的
                pattern = new RegExp('^-\\d+\\.\\d{' + obj['decimal'].replace('-', ',') + '}$');
            } else if (obj['size'] && !obj.hasOwnProperty('type') && obj['decimal']) {
                // /^-?\d+\.\d{1,3}$/  浮点数（正负均可），整数部分和小数部分均限定
                pattern = new RegExp('^-?\\d{' + obj['size'].replace('-', ',') + '}\\.\\d{' + obj['decimal'].replace('-', ',') + '}$');
            } else if (obj['size'] && obj['type'] == '+1' && obj['decimal']) {
                // /^\d{1,3}\.\d{1,3}$/  正浮点数，整数部分和小数部分均限定
                pattern = new RegExp('^\d{' + obj['size'].replace('-', ',') + '}\\.\\d{' + obj['decimal'].replace('-', ',') + '}$');
            } else if (obj['size'] && obj['type'] == '-1' && obj['decimal']) {
                // /^-\d{1,3}\.\d{1,3}$/  负浮点数，整数部分和小数部分均限定
                pattern = new RegExp('^-\\d{' + obj['size'].replace('-', ',') + '}\\.\\d{' + obj['decimal'].replace('-', ',') + '}$');
            }
        } else if (type == 'zh') {
            //砍掉尾巴2位('+$''),然后拼接{form,to}       
            pattern = new RegExp('^[\\u4e00-\\u9fa5]{' + obj['size'].replace('-', ',') + '}$');
        } else if (type == 'en') {
            pattern = new RegExp('^[a-zA-Z]{' + obj['size'].replace('-', ',') + '}$')
        } else if (type == 'select') {
            pattern = obj['size'];
        }
    } else {
        throw rule + ' is wrong.';
    }
    return pattern
};
// blur校验input value
$(document).on('change', ':input[data-rule]', function(event) {
    if ($(this).type == 'checkbox' || $(this).type == 'radio') return
    if (_checkIt($(this))) {
        _successHandler($(this));
    } else {
        _warn($(this).data('help') || $(this).prop('placeholder') || '格式错误');
        _errorHandler($(this));
    }
})
export default {
    /**
     * 校验指定范围内的所有表单元素的输入是否有效
     * @param  {String} selector [description]
     * @return {Boolean}         [返回true或false]
     */
    validate(selector) {
            let isValid;
            $(selector).find(':input[data-rule]').each(function() {
                if (_checkIt($(this))) {
                    _successHandler($(this));
                    isValid = true;
                } else {
                    _warn($(this).data('help') || $(this).prop('placeholder') || '格式错误');
                    _errorHandler($(this));
                    isValid = false;
                    return false
                }
            })
            return isValid;
        },
        /**
         * 注册一个新的校验类型
         * @param  {Object} object {type:'REG_NAME',pattern:正则表达式}
         * @return {[type]} 往默认的defaults对象里添加新的键值对
         */
        register(object) {
            $.each(object, function(key, val) {
                if (!/^REG_/i.test(key)) {
                    throw object.type + ' is invalid name.it must start with "REG_"'
                }
                //默认属性放后头，确保不会被新注册的覆盖    
                $.extend(patterns, {
                    [key.toLowerCase()]: val
                }, defaults);
            })
        },
        /**
         * 暴露出来的重置接口
         * @param  {String}     type ['warn|errorHandler|successHandler',warn表示展示错误信息；errorHander表示错误时执行的操作]
         * @param  {Function}   slot [函数或字符串]
         * @return                   [重置内部的方法]
         */
        reset(type, slot) {
            if (type == 'warn') {
                _warn = slot;
            } else if (type == 'errorHandler') {
                _errorHandler = slot;
            } else if (type == 'successHandler') {
                _successHandler = slot;
            } else {
                throw type + ' is not invalid type'
            }
        }
}
