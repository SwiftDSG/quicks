<template>
  <div class="rd-loading">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
</template>

<style lang="scss" scoped>
  .rd-loading {
    position: relative;
    width: 64px;
    height: 64px;
    border-radius: 32px;
    background: #f8f8f8;
    display: inline-block;
    &::before {
      content: "";
      position: absolute;
      top: 8px;
      left: 8px;
      width: 48px;
      height: 48px;
      border-radius: 24px;
      background: #fff;
    }
    div {
      box-sizing: border-box;
      display: block;
      position: absolute;
      width: 64px;
      height: 64px;
      border: 8px solid #c4c4c4;
      border-radius: 50%;
      animation: rotate 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      border-color: #c4c4c4 transparent transparent transparent;
      &:nth-child(1) {
        animation-delay: -0.45s;
      }
      &:nth-child(2) {
        animation-delay: -0.3s;
      }
      &:nth-child(3) {
        animation-delay: -0.15s;
      }
    }
  }
  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
