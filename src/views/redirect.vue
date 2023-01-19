<template>
  <n-empty description="正在重定向" style="margin:10px;">
    <template #icon>
      <n-icon>
        <PlanetSharp />
      </n-icon>
    </template>
  </n-empty>
</template>

<script>
import {
    PlanetSharp
} from "@vicons/ionicons5";
export default {
    components:{
        PlanetSharp
    }
}
</script>

<style>

</style>