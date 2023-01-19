<template>
    <n-space vertical id="app">
        <n-layout has-sider>
            <n-config-provider :theme="themes.darkTheme" :theme-overrides="themes.appThemeOverrides">
                <n-layout-sider id="appSider" bordered collapse-mode="width" :collapsed-width="64" :width="260"
                    :collapsed="menuCollapsed" show-trigger="bar" @collapse="menuCollapsed = true"
                    @expand="menuCollapsed = false" v-show="!isPanelFullScreen">
                    <n-layout-header class="sysLogo">
                        <img src="./assets/logo_rect.png" alt="" class="logoImg" />
                        <span v-show="!menuCollapsed">FreeTabs Framework</span>
                    </n-layout-header>
                    <n-menu :accordion="true" :collapsed="menuCollapsed" :collapsed-width="64" :collapsed-icon-size="22"
                        :options="menuOptions" :render-label="renderMenuLabel" :expanded-keys="expandedKeys"
                        :expand-icon="expandIcon" :value="menuValue" :on-update:value="handleMenuChange"
                        :on-update:expanded-keys="handleMenuExpandedKeys" />
                </n-layout-sider>
            </n-config-provider>
            <n-layout id="content">
                <div :class="{
                    contentHeader: true,
                    fullScreen: isPanelFullScreen,
                    fullScreenShow: isPanelFullScreenShown,
                }">
                    <div class="nav">
                        <n-space justify="space-between">
                            <div class="left">
                                <n-button text style="font-size: 20px" @click="menuCollapsed = !menuCollapsed"
                                    v-show="!isPanelFullScreen">
                                    <n-icon>
                                        <TrailSignSharp />
                                    </n-icon>
                                </n-button>
                                <n-button strong secondary round type="info" v-show="isPanelFullScreen"
                                    @click="toggleFullScreen(false)">
                                    退出演示模式
                                </n-button>
                                <n-button text style="font-size: 20px" @click="routerBack"
                                    :disabled="!hasBackRouterPath">
                                    <n-icon>
                                        <ArrowBackSharp />
                                    </n-icon>
                                </n-button>
                                <n-button text style="font-size: 20px" @click="refreshPage">
                                    <n-icon>
                                        <RefreshSharp />
                                    </n-icon>
                                </n-button>
                            </div>
                            <div class="right">
                                <n-button text style="font-size: 20px">
                                    <n-icon>
                                        <SearchSharp />
                                    </n-icon>
                                </n-button>
                                <n-button text style="font-size: 20px" @click="screenFull()">
                                    <n-icon>
                                        <ResizeSharp />
                                    </n-icon>
                                </n-button>
                                <n-dropdown trigger="hover" :options="avatarHoverOptions"
                                    @select="handleAvatarDropDownSelect">
                                    <n-badge :value="unreadMesaageCount">
                                        <n-avatar round size="small" src="" />
                                    </n-badge>

                                </n-dropdown>
                            </div>
                        </n-space>
                    </div>
                    <div class="tabs" v-show="!isPanelFullScreen">
                        <n-config-provider :theme-overrides="themes.tabThemeOverrides">
                            <n-tabs v-model:value="currentKey" type="card" tab-style="min-width: 80px;"
                                @close="handleTagClose" @update:value="handleTagChange" @contextmenu.stop.prevent="">
                                <n-tab-pane v-for="panel in panels" :key="panel.key" :name="panel.key" :closable="true">
                                    <template v-slot:tab>
                                        <n-dropdown :show="panel.showTagDropdown" :options="tagHoverOptions" @select="
                                            handleTagMenuSelect(
                                                $event,
                                                panel
                                            )
                                        " @clickoutside="
    panel.showTagDropdown = false
">
                                            <p style="margin: 0 10px 0 0" @click.right="
                                                handleTagClickRight(panel)
                                            " @mousedown="handleTabMouseDown(panel, $event)">
                                                {{ panel.name }}
                                            </p>
                                        </n-dropdown>
                                    </template>
                                    <div style="display: none"></div>
                                </n-tab-pane>
                            </n-tabs>
                        </n-config-provider>
                    </div>
                </div>
                <n-scrollbar x-scrollable :style="{
                    height: isPanelFullScreen
                        ? '100vh'
                        : 'calc(100vh - 107px)',
                }">
                    <div class="contentApp">
                        <div v-for="panel in panels" :key="panel.key">
                            <keep-alive v-if="panel.keepAlive">
                                <component :is="panel.component" v-if="panel.key == currentKey" :panelKey="panel.key" />
                            </keep-alive>
                        </div>
                    </div>
                </n-scrollbar>
            </n-layout>
        </n-layout>
    </n-space>
</template>

<script>
import {
    h,
    reactive,
    ref,
    computed,
    provide,
    onMounted,
    onBeforeUnmount,
} from "vue";
import { getCurrentInstance, inject } from "@vue/runtime-core";
import { NIcon, useDialog } from "naive-ui";
import { useRouter } from "vue-router";
import screenfull from "screenfull";
import {
    ChevronDownSharp,
    LinkSharp,
    SettingsSharp,
    DiceSharp,
    ArrowBackSharp,
    ArrowForwardSharp,
    RefreshSharp,
    SwapHorizontalSharp,
    TrailSignOutline as TrailSignSharp,
    SearchSharp,
    Contract,
    ResizeSharp,
    LogOutSharp,
    FileTrayFullSharp,
    PersonCircle
} from "@vicons/ionicons5";
import { darkTheme, useMessage, useLoadingBar } from "naive-ui";
import appThemeOverrides from "./themes/sideBar.json";
import tabThemeOverrides from "./themes/tab.json";
import { views, tabsTranslation } from "./views.js";

export default {
    components: {
        ...views,
        RefreshSharp,
        SwapHorizontalSharp,
        TrailSignSharp,
        SearchSharp,
        Contract,
        ResizeSharp,
        ArrowBackSharp,
        FileTrayFullSharp,
        PersonCircle
    },
    setup() {
        const $axios = inject('$axios');
        const $baseURL = getCurrentInstance()?.appContext.config.globalProperties.$baseURL;
        let isPanelFullScreenShown = ref(false);
        isPanelFullScreenShown.value
        let headerDiv;
        let router = useRouter();
        const { proxy } = getCurrentInstance();
        const unreadMesaageCount = ref(null);

        // 为了解决某些兼容性问题
        function composedPath(e) {
            // 存在则直接return
            if (e.path) { return e.path }
            // 不存在则遍历target节点
            let target = e.target
            e.path = []
            while (target.parentNode !== null) {
                e.path.push(target)
                target = target.parentNode
            }
            // 最后补上document和window
            e.path.push(document, window)
            return e.path
        }

        function mousemoveHandler(ev) {
            if (ev.clientY < 25) {
                isPanelFullScreenShown.value = true;
            } else {
                for (let item of composedPath(ev)) {
                    if (item == headerDiv) {
                        return;
                    }
                }
                isPanelFullScreenShown.value = false;
            }
        }

        onMounted(() => {
            headerDiv = document.querySelector("div.contentHeader");
            window.addEventListener("mousemove", mousemoveHandler);
        });

        onBeforeUnmount(() => {
            window.removeEventListener("mousemove", mousemoveHandler);
        });

        const message = useMessage();
        const loadingBar = useLoadingBar();
        const dialog = useDialog();

        //全屏相关代码
        function screenFull() {
            screenfull.toggle();
        }

        //菜单相关代码
        const menuValue = ref("");
        const expandedKeys = ref([]);
        const menuCollapsed = ref(false);

        function renderIcon(icon) {
            return () => h(NIcon, null, { default: () => h(icon) });
        }

        const menuOptions = [
            // 在菜单中使用外链的demo
            {
                label: "前往米糊的云栖之地",
                key: "goto-ricepaste",
                href: "https://codesocean.top",
                icon: renderIcon(LinkSharp)
            },
            {
                label: "主控台",
                key: "dashBoard",
                disabled: !hasMenuPermission("dashBoard"),
                icon: renderIcon(DiceSharp),
                requireNewTab: false
            },
            {
                label: "FreeTabs演示",
                key: "freeTabs",
                disabled: !hasMenuPermission("freeTabs"),
                icon: renderIcon(DiceSharp),
                requireNewTab: false
            },
        ];

        const tagPagesList = ref([]);

        class newKeyIndex {
            constructor() {
                this.currentIndex = 0;
                this.newIndex = () => {
                    this.currentIndex++;
                    return this.currentIndex - 1;
                };
            }
        }

        const newIndexer = new newKeyIndex();

        // 处理菜单点击事件
        function handleMenuChange(key, item) {
            runTabThroughMenu(key, item);
        }
        // 处理菜单折叠面板变化事件
        function handleMenuExpandedKeys(keys) {
            expandedKeys.value = keys;
        }

        //Tags标签相关代码
        const breadcrumbOptions = reactive([]);
        const curTagKeyRef = ref(undefined);
        const panelsReactive = ref([]);

        //通过导航菜单启动新标签页
        function runTabThroughMenu(tabKey, item) {
            if (item.href) {
                return;
            }
            if (item.requireNewTab) {
                addTabPage(tabKey);
                return;
            }
            for (let item of panelsReactive.value) {
                if (item.component == tabKey) {
                    tabJumpTo(item.key);
                    return;
                }
            }
            //如果没有找到导航菜单对应的已开启标签页
            addTabPage(tabKey);
        }

        //Tab左右拖动调整顺序相关代码
        let TabMoveTimer;
        let currentMouseX;
        document.addEventListener("mousemove", (ev) => {
            currentMouseX = ev.screenX;
        })

        document.addEventListener("mouseup", (ev) => {
            clearInterval(TabMoveTimer);
        })

        function handleTabMouseDown(panel, event) {
            if (event.button == 0) {
                let startX = event.screenX;
                let offset = 0;
                TabMoveTimer = setInterval(() => {
                    if (startX - currentMouseX > 90) {
                        //左移
                        startX = currentMouseX;
                        tagMoveLeft(panel, false);
                    } else if (currentMouseX - startX > 90) {
                        //右移
                        startX = currentMouseX;
                        tagMoveRight(panel, false);
                    }
                }, 50);
            }
        }

        function addTabPage(
            keyName,
            nameParam,
            isQuiet = false,
            keepAlive = true,
            params = {}
        ) {
            let key = keyName + newIndexer.newIndex();
            panelsReactive.value.push({
                name:
                    tabsTranslation[keyName] +
                    (nameParam != undefined ? " - " + nameParam : ""),
                key: key,
                component: keyName,
                keepAlive: keepAlive,
                showTagDropdown: false,
                params: JSON.parse(JSON.stringify(params)),
                routerPath: [],
            });
            if (!isQuiet) {
                tabJumpTo(key);
            }
        }

        //启动时默认启动主控台
        addTabPage("dashBoard");

        // 处理标签关闭事件
        function handleTagClose(panelKey) {
            const index = panelsReactive.value.findIndex(
                (v) => panelKey === v.key
            );
            panelsReactive.value.splice(index, 1);
            if (panelsReactive.value.length === 0) {
                addTabPage("dashBoard");
                return;
            } else {
                let panels = JSON.parse(
                    JSON.stringify(panelsReactive.value)
                ).reverse();
                if (curTagKeyRef.value === panelKey) {
                    for (let item of panels) {
                        if (item.key != panelKey) {
                            tabJumpTo(item.key);
                            return;
                        }
                    }
                }
            }
        }

        // 处理标签点击事件
        function handleTagChange(value) {
            tabJumpTo(value);
        }
        // 处理标签右击事件
        function handleTagClickRight(panel) {
            panel.showTagDropdown = true;
        }
        // 处理标签左移事件
        function tagMoveLeft(panel, allowWarn = true) {
            let tagIndex = panelsReactive.value.indexOf(panel);
            if (tagIndex == 0) {
                if (allowWarn) message.error("已经是第一个标签了");
            } else {
                [
                    panelsReactive.value[tagIndex],
                    panelsReactive.value[tagIndex - 1],
                ] = [
                        panelsReactive.value[tagIndex - 1],
                        panelsReactive.value[tagIndex],
                    ];
            }
        }
        // 处理标签右移事件
        function tagMoveRight(panel, allowWarn) {
            let tagIndex = panelsReactive.value.indexOf(panel);
            if (tagIndex == panelsReactive.value.length - 1) {
                if (allowWarn) message.error("已经是最后一个标签了");
            } else {
                [
                    panelsReactive.value[tagIndex],
                    panelsReactive.value[tagIndex + 1],
                ] = [
                        panelsReactive.value[tagIndex + 1],
                        panelsReactive.value[tagIndex],
                    ];
            }
        }

        // 处理标签菜单选择事件
        function handleTagMenuSelect(key, panel) {
            panel.showTagDropdown = false;
            if (String(key) == "move-left") {
                tagMoveLeft(panel);
            } else if (String(key) == "move-right") {
                tagMoveRight(panel);
            } else if (String(key) == "close") {
                handleTagClose(panel.key);
            } else if (String(key) == "fullscreen") {
                toggleFullScreen();
            }
        }

        //标签页切换相关代码
        //跳转到指定目标的标签页（使用标签页的key）
        function tabJumpTo(destinationKey) {
            loadingBar.start();
            function gotoPath(menuItem) {
                menuValue.value = menuItem.key;
                setTimeout(() => {
                    loadingBar.finish();
                });
            }
            let newMenuValue = "";
            for (let item of panelsReactive.value) {
                if (item.key == destinationKey) {
                    newMenuValue = item.component;
                    curTagKeyRef.value = item.key;
                    setTimeout(() => {
                        if (item.onShowFn) {
                            item.onShowFn();
                        }
                    })
                }
            }
            for (let item of menuOptions) {
                if (item.key == newMenuValue) {
                    gotoPath(item);
                    return;
                }
                if (item.children) {
                    for (let child of item.children) {
                        if (child.key == newMenuValue) {
                            gotoPath(child);
                            expandedKeys.value = [item.key];
                            return;
                        }
                    }
                }
                setTimeout(() => {
                    loadingBar.finish();
                });
            }
        }

        //获取所有tab的接口
        function getAllTabs() {
            return panelsReactive.value;
        }

        //刷新页面
        function refreshPage() {
            let currentKey = curTagKeyRef.value;
            let currentKeepAlive;
            let panelItem;
            for (let item of panelsReactive.value) {
                if (item.key == currentKey) {
                    currentKeepAlive = item.keepAlive;
                    item.keepAlive = false;
                    curTagKeyRef.value = "redirect";
                    panelItem = item;
                }
            }
            setTimeout(() => {
                tabJumpTo(currentKey);
                panelItem.keepAlive = currentKeepAlive;
            });
        }

        proxy.$refreshPage.func = refreshPage;

        //路由返回
        function routerBack() {
            for (let panel of panelsReactive.value) {
                if (panel.key == curTagKeyRef.value) {
                    if (panel.routerPath.length > 0) {
                        //更改回实例对象
                        let backPanel = panel.routerPath.pop();
                        panel.name = backPanel.name;
                        panel.key = backPanel.key;
                        panel.component = backPanel.component;
                        panel.keepAlive = backPanel.keepAlive;
                        panel.showTagDropdown = backPanel.showTagDropdown;
                        panel.params = backPanel.params;
                        tabJumpTo(backPanel.key);
                        return;
                    }
                }
            }
            message.error("已经是最后一页了");
        }

        //判断是否能返回
        let hasBackRouterPath = computed(() => {
            for (let panel of panelsReactive.value) {
                if (panel.key == curTagKeyRef.value) {
                    if (panel.routerPath.length > 0) return true;
                }
            }
            return false;
        });

        //全屏相关代码
        const isPanelFullScreen = ref(false);

        function toggleFullScreen(value) {
            // console.log(screenfull);
            if (!screenfull.isFullscreen && isPanelFullScreen.value == false) {
                dialog.info({
                    title: "进入演示模式的方式",
                    content: "你是否需要在进入演示模式的同时，覆盖整块屏幕？",
                    positiveText: "同时全屏",
                    negativeText: "仅启动演示模式",
                    onPositiveClick: () => {
                        screenfull.toggle();
                        if (value == undefined) {
                            isPanelFullScreen.value = !isPanelFullScreen.value;
                        } else {
                            isPanelFullScreen.value = value;
                        }
                        refreshPage();
                    },
                    onNegativeClick: () => {
                        if (value == undefined) {
                            isPanelFullScreen.value = !isPanelFullScreen.value;
                        } else {
                            isPanelFullScreen.value = value;
                        }
                        refreshPage();
                    },
                });
            } else {
                if (value == undefined) {
                    isPanelFullScreen.value = !isPanelFullScreen.value;
                } else {
                    isPanelFullScreen.value = value;
                }
                refreshPage();
            }
        }

        function handleAvatarDropDownSelect(key) {
            switch (key) {
                case "logout":
                    logout();
            }
        }

        function logout() {
            localStorage.removeItem("system-cache");
            router.push("/login");
        }

        // 判断权限
        function hasMenuPermission(permissionName) {
            return true;
        }

        provide("FreeTabs", {
            //self下的方法只对活动标签有用，因此必须先指明当前活动标签
            selfActive(panelKey) {
                if (panelKey == curTagKeyRef.value) {
                    return {
                        refreshPage,
                        toggleFullScreen,
                    };
                } else {
                    message.error("FreeTabs：不是当前活动标签，无权执行操作");
                }
            },
            self(panelKey) {
                return {
                    close(panelKey) {
                        handleTagClose(curTagKeyRef.value);
                    },
                    redirectTo(
                        keyName,
                        nameParam,
                        keepAlive = true,
                        params = {}
                    ) {
                        for (let panel of panelsReactive.value) {
                            if (panel.key == panelKey) {
                                let key = keyName + newIndexer.newIndex();
                                //更改实例对象
                                panel.routerPath.push(
                                    JSON.parse(JSON.stringify(panel))
                                );
                                panel.name =
                                    tabsTranslation[keyName] +
                                    (nameParam != undefined
                                        ? " - " + nameParam
                                        : "");
                                panel.key = key;
                                panel.component = keyName;
                                panel.keepAlive = keepAlive;
                                panel.showTagDropdown = false;
                                panel.params = JSON.parse(
                                    JSON.stringify(params)
                                );
                                tabJumpTo(key);
                            }
                        }
                    },
                    params() {
                        for (let panel of panelsReactive.value) {
                            if (panel.key == panelKey) {
                                return panel.params;
                            }
                        }
                    },
                    changeTabName(nameParam) {
                        let panel;
                        for (let item of panelsReactive.value) {
                            if (panelKey == item.key) {
                                panel = item;
                            }
                        }
                        panel.name =
                            tabsTranslation[panel.component] +
                            (nameParam != undefined ? " - " + nameParam : "");
                    },
                    routerBack,
                    onShow(fn) {
                        const index = panelsReactive.value.findIndex(
                            (v) => curTagKeyRef.value === v.key
                        );
                        panelsReactive.value[index].onShowFn = fn;
                    }
                };
            },
            addTabPage,
            getAllTabs,
            tabJumpTo
        });

        return {
            themes: {
                darkTheme,
                appThemeOverrides,
                tabThemeOverrides,
            },
            refreshPage,
            screenFull,

            menuCollapsed,
            menuOptions,
            renderMenuLabel(option) {
                if ("href" in option) {
                    return h(
                        "a",
                        { href: option.href, target: "_blank" },
                        option.label
                    );
                }
                return option.label;
            },
            renderMenuIcon(option) {
                if (option.key === "sheep-man") return true;
                if (option.key === "food") return null;
                if (option.icon != undefined) {
                } else {
                    return h(NIcon, null, { default: () => h(LinkSharp) });
                }
            },
            expandIcon() {
                return h(NIcon, null, { default: () => h(ChevronDownSharp) });
            },
            menuValue,
            handleMenuChange,
            handleMenuExpandedKeys,
            handleAvatarDropDownSelect,
            expandedKeys,
            panels: panelsReactive,
            currentKey: curTagKeyRef,
            tabsTranslation,
            handleTagClickRight,
            handleTagClose,
            handleTagChange,
            handleTagMenuSelect,
            isPanelFullScreen,
            isPanelFullScreenShown,
            toggleFullScreen,
            routerBack,
            hasBackRouterPath,
            unreadMesaageCount,
            tagHoverOptions: [
                {
                    label: "演示模式",
                    key: "fullscreen",
                },
                {
                    label: "移动标签页",
                    key: "move",
                    children: [
                        {
                            label: "左移标签",
                            key: "move-left",
                            icon: renderIcon(ArrowBackSharp),
                        },
                        {
                            label: "右移标签",
                            key: "move-right",
                            icon: renderIcon(ArrowForwardSharp),
                        },
                    ],
                },
                {
                    label: "关闭标签页",
                    key: "close",
                },
            ],
            avatarHoverOptions: [
                {
                    label: "退出登录",
                    key: "logout",
                    icon: renderIcon(LogOutSharp),
                },
            ],
            handleTabMouseDown
        };
    },
};
</script>

<style lang="scss" scoped>
#app {
    #appSider {
        height: 100vh;

        .sysLogo {
            margin: 10px 0;
            display: flex;
            justify-content: center;
            align-items: center;

            .logoImg {
                height: 40px;
                margin: 5px;
            }

            span {
                margin: 5px;
                line-height: 40px;
                font-size: 17px;
                font-weight: bold;
                white-space: nowrap;
                overflow: hidden;
            }
        }
    }

    #content {
        .contentHeader {
            background-color: #f5f7f9;
            transition: top 0.5s;

            .nav {
                height: 64px;
                overflow: hidden;
                box-shadow: 0 1px 4px rgb(0 21 41 / 8%);
                background-color: #fff;

                div.left {
                    display: flex;
                    align-items: center;
                    height: 64px;
                    padding: 0 18px;

                    .n-button {
                        margin-right: 18px;
                    }
                }

                div.right {
                    display: flex;
                    align-items: center;
                    height: 64px;
                    padding: 0 18px;

                    .n-button {
                        margin-right: 18px;
                    }
                }
            }

            .tabs {
                padding: 4px 4px 0 4px;
                background-color: #ffffff00;
                user-select: none;

                .n-tab-pane {
                    display: none;
                }
            }
        }

        .contentHeader.fullScreen {
            position: absolute;
            z-index: 10000;
            width: 100vw;
            top: -72px;
        }

        .contentHeader.fullScreenShow {
            top: 0;
        }
    }
}
</style>
