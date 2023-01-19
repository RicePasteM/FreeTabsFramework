<template>
    <div class="outer">
        <n-h1>FreeTabs API - 演示</n-h1>
        <n-p class="description">
            FreeTabs-API是一套能够让你随处控制整个多实例多标签页路由系统的API，由米糊花了一天完成。
            通过它，你可以在系统各处控制多标签页系统的各项功能。
            目前，我仅对它添加了非常基础的权限机制，因为我认为系统内部的各个模块是相互信任的。
        </n-p>
        <n-form ref="formRef" :show-label="true">
            <p>
                我的panelKey: {{panelKey}}
            </p>
            <p>
                我的页面参数: {{tabManager.self(panelKey).params()}}
            </p>
            <n-form-item label="创建新标签页 addTabPage(新页面的Key,新页面的标题,是否静默启动,是否需要keep-alive,参数)">
                <n-button @click="tabManager.addTabPage('dashBoard','新标签页启动的')" type="primary">类似target="_blank"</n-button>
            </n-form-item>
            <n-form-item label="静默创建新标签页 addTabPage(新页面的Key,新页面的标题,是否静默启动,是否需要keep-alive,参数)">
                <n-button @click="tabManager.addTabPage('dashBoard','悄悄启动的',true)" type="primary">很像某些流氓软件</n-button>
            </n-form-item>
            <n-form-item label="携带参数创建新标签页 addTabPage(新页面的Key,新页面的标题,是否静默启动,是否需要keep-alive,参数)">
                <n-button @click="tabManager.addTabPage('dashBoard','带一个参数',undefined,undefined,{'me':2})" type="primary">闭卷考试的时候不能这样</n-button>
            </n-form-item>
            <n-form-item label="改变当前副标题 changeTabName(标题名称)">
                <n-button @click="tabManager.self(panelKey).changeTabName('慢慢张开你的眼睛')" type="primary">轻轻敲醒沉睡的心灵</n-button>
            </n-form-item>
            <n-form-item label="关闭当前标签页 close()">
                <n-button @click="tabManager.self(panelKey).close()" type="primary">关掉，关掉，一定要关掉！</n-button>
            </n-form-item>
            <n-form-item label="获取所有后台标签页 & 跳转到后台标签页 getAllTabs()&&tabJumpTo(要跳转的页面的Key)">
                <n-button style="margin-right:10px;" v-for="item in tabManager.getAllTabs()" :key="item.key" @click="tabManager.tabJumpTo(item.key)" type="primary">{{item.name}} {{item.key}}</n-button>
            </n-form-item>
            <n-form-item label="刷新活动标签页 refreshPage()">
                <n-button style="margin-right:10px;" @click="tabManager.selfActive(panelKey).refreshPage()" type="primary">DRAM的刷新有哪三种方式</n-button>
            </n-form-item>
            <n-form-item label="进入演示模式 toggleFullScreen()">
                <n-button style="margin-right:10px;" @click="tabManager.selfActive(panelKey).toggleFullScreen()" type="primary">Three, two, one...Music!</n-button>
            </n-form-item>
            <n-form-item label="标签页路由重定向 redirectTo(新页面的Key,新页面的标题,是否需要keep-alive,参数)">
                <n-button style="margin-right:10px;" @click="tabManager.self(panelKey).redirectTo('freeTabs','美丽新世界',undefined,{place:0})" type="primary">送我去一个美丽的地方
                </n-button>
            </n-form-item>
            <n-form-item label="标签页路由返回 routerBack()">
                <n-button style="margin-right:10px;" @click="tabManager.self(panelKey).routerBack()" type="primary">回不去了...再也回不去了
                </n-button>
            </n-form-item>
        </n-form>
        
        
    </div>

</template>

<script>
import { inject, onMounted } from '@vue/runtime-core'
export default {
    props:{
        panelKey:String
    },
    setup(props, context){
        onMounted(()=>{
        })

        const tabManager = inject("FreeTabs");

        return{
            tabManager
        }
    }
}
</script>

<style scoped lang="scss">
    .outer{
        background-color:white;
        padding:30px;
        .description{
            font-size:18px;
        }
    }
</style>