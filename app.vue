<template>
  <div class="rd-layout">
    <div class="rd-fab-container" ref="rdFabContainer">
      <rd-input-button-tabs
        :state="optionSelected"
        :option="fabOptions"
        @changed="optionChange"
      />
    </div>
    <rd-chat-list-panel
      :state="optionState"
      v-if="optionSelected === 'chat-list'"
      class="rd-inbox-panel"
      @open-chat="openChat"
    />
    <rd-chat-panel
      :state="optionState"
      :data="optionData"
      v-if="optionSelected === 'chat'"
      class="rd-inbox-panel"
      @close-chat="optionChange"
    />
    <rd-task-panel
      :state="optionState"
      v-if="optionSelected === 'task'"
      class="rd-inbox-panel"
    />
  </div>
</template>

<script lang="ts" setup>
  import gsap from "gsap";
  import { Chat, ChatMessage } from "./interfaces/general";

  interface FABOption {
    icon: string;
    action: string;
    name: string;
    color: string;
  }

  const fabOptions: FABOption[] = [
    {
      icon: "chat",
      action: "chat-list",
      name: "Inbox",
      color: "chat",
    },
    {
      icon: "task",
      action: "task",
      name: "Task",
      color: "task",
    },
  ];

  const optionSelected = ref<"task" | "chat" | "chat-list">(null);
  const optionState = ref<"show" | "hide">(null);
  const optionData = ref<any>(null);

  function optionChange(option?: "task" | "chat" | "chat-list"): void {
    if (optionSelected.value) {
      optionState.value = "hide";
      setTimeout(() => {
        if (option) {
          optionState.value = "show";
          optionSelected.value = option;
        } else {
          optionSelected.value = null;
        }
      }, 375);
    } else if (option) {
      optionState.value = "show";
      optionSelected.value = option;
    }
  }
  function openChat(chat: Chat): void {
    optionData.value = {
      chat,
    };
    optionChange("chat");
  }
</script>

<style lang="scss" scoped>
  .rd-layout {
    position: relative;
    width: 100vw;
    height: 100vh;
    display: flex;
    .rd-fab-container {
      position: fixed;
      bottom: 27px;
      right: 34px;
      width: 68px;
      height: 68px;
      display: flex;
      justify-content: center;
      align-items: center;
      .rd-fab-button-container {
        position: absolute;
        right: 4px;
        width: 60px;
        height: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
    .rd-inbox-panel {
      right: 34px;
      bottom: 110px;
    }
  }
</style>

<style lang="scss">
  :root {
    --primary-color: #2f80ed;
    --secondary-color: #e0e0e0;
    --tersier-color: #f2f2f2;
    --chat-color: #8785ff;
    --task-color: #f8b76b;
    --error-color: #eb5757;
    --warning-color: #ffc904;
    --success-color: #6bc785;
    --border-color: #828282;
    --font-main-color: #4f4f4f;
    --font-secondary-color: #828282;
    --background-depth-one-color: #e0e0e0;
    --background-depth-two-color: #828282;
    --background-depth-three-color: #4f4f4f;
    --background-depth-four-color: #262626;
    --border: 1px solid var(--border-color);
    --box-shadow: 0 0.5rem 1rem rgba(45, 45, 45, 0.125);
  }
  *::-webkit-scrollbar {
    display: none;
    opacity: 0;
  }
  html,
  body {
    position: relative;
    width: 100vw;
    margin: 0;
    padding: 0;
    font-size: 24px;
    font-family: "Quicksand", -apple-system, BlinkMacSystemFont, sans-serif;
    color: var(--font-main-color);
    background: var(--background-depth-four-color);
    overflow-x: hidden;
    @media only screen and (max-width: 1900px) and (min-width: 1600px) {
      font-size: 22px;
    }
    @media only screen and (max-width: 1599px) and (min-width: 1480px) {
      font-size: 21px;
    }
    @media only screen and (max-width: 1479px) and (min-width: 1380px) {
      font-size: 20px;
    }
    @media only screen and (max-width: 1379px) and (min-width: 1320px) {
      font-size: 19px;
    }
    @media only screen and (max-width: 1319px) and (min-width: 1024px) {
      font-size: 18px;
    }
    @media only screen and (max-width: 640px) {
      font-size: 24px;
    }
    @media only screen and (max-width: 320px) {
      font-size: 17px;
    }
    @media only screen and (max-width: 1024px) {
      height: auto;
      overflow-y: auto;
    }
  }
  .rd-headline-1 {
    font-size: 1.25rem;
    font-weight: 700;
    font-family: "Lato";
  }
  .rd-headline-2 {
    font-size: 1rem;
    font-weight: 700;
    font-family: "Lato";
  }
  .rd-headline-3 {
    font-size: 0.85rem;
    font-weight: 700;
    font-family: "Lato";
  }
  .rd-headline-4 {
    font-size: 16px;
    font-weight: 700;
    font-family: "Lato";
  }
  .rd-headline-5 {
    font-size: 14px;
    font-weight: 700;
    font-family: "Lato";
  }
  .rd-headline-6 {
    font-size: 12px;
    font-weight: 700;
    font-family: "Lato";
  }
  .rd-subtitle-text {
    font-size: 16px;
    font-weight: 400;
    font-family: "Lato";
  }
  .rd-body-text {
    font-size: 14px;
    font-weight: 400;
    font-family: "Lato";
  }
  .rd-caption-text {
    font-size: 12px;
    font-family: "Lato";
    font-weight: 400;
  }
  .rd-button-text {
    font-family: "Lato";
    font-size: 0.55rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.125rem;
    transform: translateX(0.0625rem);
  }
  span.rd-text-wrapper,
  span.rd-word-wrapper,
  span.rd-letter-wrapper,
  span.rd-image-wrapper {
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    span.rd-text-container,
    span.rd-word-container,
    span.rd-letter-container,
    span.rd-image-container {
      position: relative;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      &.rd-text-container-up,
      &.rd-word-container-up,
      &.rd-letter-container-up,
      &.rd-image-container-up {
        transform: translateY(-100%);
        span.rd-text,
        span.rd-word,
        span.rd-letter,
        img.rd-image {
          transform: translateY(100%);
          &.rd-image:not(.rd-image-contain) {
            transform: translateY(100%) scale(1.25);
          }
          &.rd-image-contain {
            object-fit: contain;
            transform: translateY(100%) scale(1);
          }
        }
      }
      &.rd-text-container-down,
      &.rd-word-container-down,
      &.rd-letter-container-down,
      &.rd-image-container-down {
        transform: translateY(100%);
        span.rd-text,
        span.rd-word,
        span.rd-letter,
        img.rd-image {
          transform: translateY(-100%);
          &.rd-image:not(.rd-image-contain) {
            transform: translateY(-100%) scale(1.25);
          }
          &.rd-image-contain {
            object-fit: contain;
            transform: translateY(-100%) scale(1);
          }
        }
      }
      &.rd-text-container-left,
      &.rd-word-container-left,
      &.rd-letter-container-left,
      &.rd-image-container-left {
        transform: translateX(-100%);
        span.rd-text,
        span.rd-word,
        span.rd-letter,
        img.rd-image {
          transform: translateX(100%);
          &.rd-image:not(.rd-image-contain) {
            transform: translateX(100%) scale(1.25);
          }
          &.rd-image-contain {
            object-fit: contain;
            transform: translateX(100%) scale(1);
          }
        }
      }
      &.rd-text-container-right,
      &.rd-word-container-right,
      &.rd-letter-container-right,
      &.rd-image-container-right {
        transform: translateX(100%);
        span.rd-text,
        span.rd-word,
        span.rd-letter,
        img.rd-image {
          transform: translateX(-100%);
          &.rd-image:not(.rd-image-contain) {
            transform: translateX(-100%) scale(1.25);
          }
          &.rd-image-contain {
            object-fit: contain;
            transform: translateX(-100%) scale(1);
          }
        }
      }
    }
  }
  span.rd-image-wrapper {
    width: 100%;
    height: 100%;
    span.rd-image-container {
      width: 100%;
      height: 100%;
      img.rd-image {
        position: relative;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transform: scale(1.25);
      }
    }
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  span {
    color: var(--font-main-color);
    margin: 0;
    padding: 0;
  }
  @keyframes rd-loading {
    0% {
      left: 0;
      right: 100%;
    }
    50% {
      left: 0;
      right: 0;
    }
    100% {
      left: 100%;
      right: 0;
    }
  }
  @keyframes rd-shake {
    0% {
      transform: translate(1px, 1px);
    }
    10% {
      transform: translate(-1px, -2px);
    }
    20% {
      transform: translate(-3px, 0px);
    }
    30% {
      transform: translate(3px, 2px);
    }
    40% {
      transform: translate(1px, -1px);
    }
    50% {
      transform: translate(-1px, 2px);
    }
    60% {
      transform: translate(-3px, 1px);
    }
    70% {
      transform: translate(3px, 1px);
    }
    80% {
      transform: translate(-1px, -1px);
    }
    90% {
      transform: translate(1px, 2px);
    }
    100% {
      transform: translate(1px, -2px);
    }
  }
  @keyframes rd-rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  @keyframes rd-circular-rotate {
    0% {
      transform: rotate(0);
    }
    50% {
      transform: rotate(-140deg);
    }
    100% {
      transform: rotate(0);
    }
  }
</style>
