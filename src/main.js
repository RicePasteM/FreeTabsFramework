import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import naive from 'naive-ui'
import axios from 'axios'
import * as echarts from 'echarts';
import 'echarts-liquidfill/dist/echarts-liquidfill.min.js'
import { useMessage } from 'naive-ui';
import 'mavon-editor/dist/css/index.css';
import mavonEditor from 'mavon-editor';
import moment from 'moment'

const message = useMessage();

// http request 拦截器
axios.interceptors.request.use(
    config => {
        return config;
    },
    err => {
        return Promise.reject(err);
});

// http 响应 拦截器
axios.interceptors.response.use(
    res => {
        return res;
    },
    err => {
        
        return Promise.reject(err);
});

let refresh = {func:null}
let reloadTimeCount = 0;
const app = createApp(App)
app.provide('$axios',axios);
app.provide('reload', () => {
    refresh.func();
    setTimeout(()=>{
        refresh.func();
    },100);
    if(reloadTimeCount == 0){
        setTimeout(()=>{ 
            refresh.func();
        },500);
        reloadTimeCount ++;
    }
})
app.provide('moment',moment);
app.use(naive)
app.use(store).use(router).use(mavonEditor).mount('#app');


var BASE_URL_DEV = 'http://127.0.0.1:8081';
var BASE_URL_PRODUCTION = 'http://121.4.73.19:8081';
var CURRENT_BASE_URL = BASE_URL_DEV;

app.directive('has-role', {
    updated(el, binding, vnode){
        filterGlobalPermission(el, binding, vnode);
    },
    mounted(el, binding, vnode){
        filterGlobalPermission(el, binding, vnode);
    }
});

const filterGlobalPermission = (el, binding, vnode) => {
    // 自行实现权限判断
}

app.config.globalProperties.$baseURL = CURRENT_BASE_URL;
app.config.globalProperties.$baseImgURL = 'http://img.codesocean.top';
app.config.globalProperties.$refreshPage = refresh;

app.config.globalProperties.$echarts = echarts;

export default CURRENT_BASE_URL;