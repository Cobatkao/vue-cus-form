<template>
    <form>
        <!-- form-item group -->
        <slot></slot>
    </form>
</template>

<script>
import { resolve4 } from 'dns';
export default {
    name: "iForm",
    props: {
        model: {
            type: Object,
        },
        rules: {
            type: Object,
        }
    },
    provide() {
        return {
            iFormData: this
        }
    },
    data() {
        return {
            cacheItems: [], //缓存form-item.vue
        }
    },
    methods: {
        //重置所有数据
        resetFields() {
            this.cacheItems.forEach(cacheItem => {
                cacheItem.reserField()
            })
        },
        //全部校验数据，支持 Promise
        validate(callback) {
            return new Promise(resolve => {
                let valid = true
                let count = 0
                this.cacheItems.forEach(cacheItem => {
                    cacheItem.validate('', errors => {
                        if (errors) {
                            valid = false
                        }
                        if (++count === this.cacheItems.lenth) {
                            //完成全部校验
                            resolve(valid)
                            if (typeof callback === 'function') {
                                callback(valid)
                            }
                        }
                    })
                })
            })
        }
    },
    created() {
        this.$on('on-form-item-add', (item) => {
            if (item) this.cacheItems.push(item);
        });
        this.$on('on-form-item-remove', (item) => {
            if (item.prop) this.cacheItems.splice(this.cacheItems.indexOf(item), 1)
        })
    }
}
</script>

<style lang="sass" scoped>

</style>
