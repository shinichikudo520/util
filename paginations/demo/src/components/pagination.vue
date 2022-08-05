<template>
  <div>
    <div id="paginationContainer"></div>
  </div>
</template>

<script>
import init from "../ts/index";
export default {
  name: 'App',
  components: {
  },
  mounted(){
    init(1000);
  }
}
</script>

<style>
#paginationContainer{
    width: 100%;
}
</style>