<template>
    <div>
        <label v-if="label" :class="{ ifRequired: isRequired }"> {{ label }} </label>
        <div>
            <!-- 具体的表单控件 -->
            <slot></slot>
            <div v-if="validateState === 'error'" class="i-form-item-message">
                {{ validateMessage }}
            </div>
        </div>
    </div>
</template>

<script>
import Emitter from "../../mixins/emitter"
import AsyncValidator from 'async-validator'

export default {
    name: "iFormItem",
    mixins: [ Emitter ],
    props: {
        label: {
            type: String,
            default: '',
        },
        prop: {
            type: String,
        }
    },
    //接收父组件的数据
    inject: ['iFormData'],
    data() {
        return {
            isRequired: false,
            validateState: '',  // 校验状态
            validateMessage: '',  // 校验不通过时的提示信息
            initialValue: ''
        }
    },
    computed: {
        // 从 Form 的 model 中动态得到当前表单组件的数据
        fieldValue () {
            return this.iFormData.model[this.prop];
        }
    },
    methods: {
        // 从 iFormData 的 rules 属性中，获取当前 FormItem 的校验规则
        getRules() {
            let formRules = this.iFormData.rules
            formRules = formRules ? formRules[this.prop] : []
            return [].concat(formRules || []);
        },
        // 只支持 blur 和 change，所以过滤出符合要求的 rule 规则
        getFilteredRule (trigger) {
            const rules = this.getRules();
            return rules.filter(rule => !rule.trigger || rule.trigger.indexOf(trigger) !== -1);
        },
        setRules() {
            let rules = this.getRules()
            if (rules.length) {
                rules.every((rule) => {
                // 如果当前校验规则中有必填项，则标记出来
                this.isRequired = rule.required;
            });
            }
            
            this.$on('on-form-change', this.onFieldChange)
            this.$on('on-form-blur', this.onFieldBlur)
        },
        resetField () {
            this.validateState = ''
            this.validateMessage = ''

            this.iFormData.model[this.prop] = this.initialValue
        },
        // 校验方法
        validate(trigger, callback = function () {}) {
            let rules = this.getFilteredRule(trigger)
            if (!rules || rules.length === 0) {
                return true;
            }

            // 设置状态为校验中
            this.validateState = 'validating'

            // 以下为 async-validator 库的调用方法
            let descriptor = {};
            descriptor[this.prop] = rules;

            const validator = new AsyncValidator(descriptor);
            let model = {};

            model[this.prop] = this.fieldValue;

            validator.validate(model, { firstFields: true }, errors => {
                this.validateState = !errors ? 'success' : 'error';
                this.validateMessage = errors ? errors[0].message : '';

                callback(this.validateMessage);
            });
        },
        onFieldBlur() {
            this.validate('blur');
        },
        onFieldChange() {
            this.validate('change');
        }
    },
    //组件挂载时，Form组件缓存每个实例
    mounted() {
        // 如果没有传入 prop，则无需校验，也就无需缓存
        if (this.prop) {
            this.dispatch('iForm', 'on-form-item-add', this)
            // 设置初始值，以便在重置时恢复默认值
            this.initialValue = this.fieldValue;
            //监听input.vue组件事件
            this.setRules()
        }
    },
    //组件销毁前，将实例从Form的缓存中移除
    beforeDestroy() {
        this.dispatch('iForm', 'on-form-item-remove', this)
    }
}
</script>

<style lang="sass" scoped>
    /* 必填样式 */
    .ifRequired:before {
        content: '*';
        color: red;
    }
    .i-form-item-message {
        color: red;
    }
</style>
