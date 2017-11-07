<template>

<section>
  <div class="app">
    <main class="app-main">
      <nuxt></nuxt>
    </main>
  </div>
</section>

</template>

<style scoped>

.app {
  display: flex;
  position: absolute;
  min-height: 100vh;
  width: 100vw;
  flex-direction: column;
}

.app-main {
  flex: 1
}

</style>
