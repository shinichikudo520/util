<template>
  <div>
    <img alt="Vue logo" src="./assets/logo.png" />
    <pagination></pagination>
  </div>
</template>


<script>
import pagination from "./components/pagination.vue";
export default {
  name: 'App',
  components: {
    pagination
  }
}
</script>
