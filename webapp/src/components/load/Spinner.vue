<template>
  <div class="spinner">
    <div class="preloader-wrapper big active loader">
      <div class="spinner-layer spinner-blue-only">
        <div class="circle-clipper left">
          <div class="circle"></div>
        </div>
        <div class="gap-patch">
          <div class="circle"></div>
        </div>
        <div class="circle-clipper right">
          <div class="circle"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css">
.loader {
  position: absolute;
  margin: auto;
  top: 50vh;
  bottom: 50vh;
  left: 0;
  right: 0;
}
</style>
