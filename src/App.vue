<template>
  <Suspense>
    <router-view />
  </Suspense>
</template>

<script setup>

import { useRouter } from 'vue-router';

window.router = useRouter();

</script>

<style>

* {
  box-sizing: border-box;
}

body {
  overflow: hidden;
  background-color: var(--surface-ground);
  margin: 0;
  font-size: 16px;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  width: 100%;
  max-height: 100vh;
  min-height: 100vh;
  position: relative;
  z-index: 0;
}

.p-blockui.p-component-overlay {
  background-color: rgba(255, 255, 255, .8) !important;
}
.p-dialog .p-dialog-header-icons {
  display: none;
}

html {
  font-size: 13px;
}

</style>
