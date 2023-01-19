<template>
    <n-config-provider :theme-overrides="appThemeOverrides">
        <n-dialog-provider>
            <n-message-provider>
                <n-loading-bar-provider>
                    <router-view></router-view>
                </n-loading-bar-provider>
            </n-message-provider>
        </n-dialog-provider>
    </n-config-provider>
</template>

<script>
import { NConfigProvider } from "naive-ui";
import appThemeOverrides from "./themes/app.json";
import * as echarts from 'echarts'
import { provide } from 'vue'
export default {
    components: {
        NConfigProvider,
    },
    setup() {
        provide('ec',echarts)//provide
        return {
            appThemeOverrides,
        };
    },
};
</script>

<style lang="scss">
@font-face
{
    font-family: "阿里巴巴普惠体";
    src: url('./static/阿里巴巴普惠体.ttf'),
}
@font-face
{
    font-family: "阿里巴巴普惠体";
    font-weight:bold;
    src: url('./static/阿里巴巴普惠体 B.ttf'),
}
*{
    font-family: "阿里巴巴普惠体";
}
.n-tabs-tab--active {
    background-color: #fff !important;
}
.n-scrollbar-rail{
    z-index:10000;
}

.n-card__action{
    overflow: auto;
}

::-webkit-scrollbar{

    width:5px;

    height:5px;

    background-color:#F5F5F5;

}

/*定义滚动条轨道

内阴影+圆角*/

::-webkit-scrollbar-track{

    -webkit-box-shadow:inset 0 0 6px rgba(206, 206, 206, 0.3);

    border-radius:10px;

    background-color:#F5F5F5;

}

/*定义滑块

内阴影+圆角*/

::-webkit-scrollbar-thumb{

    border-radius:10px;

    -webkit-box-shadow:inset 0 0 6px rgba(255, 255, 255, 0.3);

    background-color:rgb(209, 209, 209);
    transition: all .3s;

}

*:hover::-webkit-scrollbar-thumb{

    border-radius:10px;

    -webkit-box-shadow:inset 0 0 6px rgba(181, 181, 181, 0.3);

    background-color:rgb(183, 183, 183);

}

.n-step-content-header__title{
    font-size:18px;
    font-weight:bold;
    
}

.n-step-content{
    padding-left:5px;
}

</style>
