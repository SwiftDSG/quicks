<template>
  <div class="rd-panel" ref="rdPanel">
    <div class="rd-panel-header">
      <rd-input-search :input="searchInput" />
    </div>
    <div class="rd-chat-container" ref="rdChatContainer">
      <div v-for="(chat, i) in chats" :key="chat._id" class="rd-chat">
        <div
          class="rd-chat-icon-container"
          :style="chat.type === 'individual' ? 'justify-content: center' : ''"
        >
          <div
            v-if="chat.type === 'group'"
            class="rd-chat-icon"
            style="background: var(--background-depth-one-color)"
          >
            <rd-svg class="rd-chat-svg" name="account" style="opacity: 0.54" />
          </div>
          <div
            class="rd-chat-icon"
            :style="chat.type === 'group' ? 'transform: translateX(-17px)' : ''"
          >
            <rd-svg
              v-if="chat.type === 'group'"
              class="rd-chat-svg"
              name="account"
              color="secondary"
            />
            <span v-else class="rd-chat-letter rd-headline-4">{{
              chat.title[0].toUpperCase()
            }}</span>
          </div>
        </div>
        <div class="rd-chat-detail-container">
          <div class="rd-chat-title-container">
            <span
              @click="chatHandler"
              :data-id="chat._id"
              class="rd-chat-title rd-headline-4"
              >{{ chat.title }}</span
            >
            <span v-if="chat.message" class="rd-chat-date rd-body-text">{{
              dateHandler(new Date(chat.message?.date))
            }}</span>
          </div>
          <div v-if="chat.message" class="rd-chat-message-container">
            <span
              v-if="chat.type === 'group'"
              class="rd-chat-participant rd-headline-5"
              >{{
                `${
                  chat.message?.from?._id === "0"
                    ? "You"
                    : chat.message?.from?.name
                } :`
              }}</span
            >
            <span class="rd-chat-message rd-body-text">{{
              chat.message?.text
            }}</span>
            <div v-if="!chat.message?.read" class="rd-chat-bubble"></div>
          </div>
        </div>
        <div v-if="i !== chats.length - 1" class="rd-chat-divider"></div>
      </div>
    </div>
    <div
      v-if="loading"
      :class="!init ? 'rd-chat-overlay-hidden' : ''"
      class="rd-chat-overlay"
      ref="rdChatOverlay"
    >
      <rd-loading class="rd-chat-loading" />
      <span class="rd-chat-message rd-subtitle-text">Loading Chats</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import gsap from "gsap";
  import { ComputedRef } from "vue";
  import { Chat, InputSearchOption } from "../interfaces/general";

  const emits = defineEmits(["open-chat"]);
  const props = defineProps<{
    state: "show" | "hide";
  }>();
  const { loadChats, selectChat } = useChat();

  const loading = ref<boolean>(true);
  const init = ref<boolean>(true);

  const chats = ref<Chat[]>(null);

  const rdPanel = ref<HTMLDivElement>(null);
  const rdChatContainer = ref<HTMLDivElement>(null);
  const rdChatOverlay = ref<HTMLDivElement>(null);

  const searchInput = ref<InputSearchOption>({
    name: "Search",
    placeholder: "Search",
    model: "",
  });
  const searchTimeout = ref<NodeJS.Timeout>(null);

  const query: ComputedRef<string> = computed(() => searchInput.value.model);

  const months: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const animate = {
    init(rdPanel: HTMLElement): void {
      const tl: GSAPTimeline = gsap.timeline();

      tl.to(rdPanel, {
        opacity: 1,
        scale: 1,
        ease: "power2.inOut",
        duration: 0.375,
      });
    },
    exit(rdPanel: HTMLElement): void {
      const tl: GSAPTimeline = gsap.timeline();

      tl.to(rdPanel, {
        opacity: 0,
        scale: 0.875,
        ease: "power2.inOut",
        duration: 0.375,
      });
    },
    show(rdChatOverlay: HTMLElement, cb?: () => void): void {
      const tl: GSAPTimeline = gsap.timeline({
        onComplete() {
          if (cb) cb();
        },
      });

      tl.to(rdChatOverlay, {
        scale: 1.125,
        opacity: 0,
        ease: "power2.inOut",
        duration: 0.25,
      });
    },
    hide(rdChatOverlay: HTMLElement, cb?: () => void): void {
      const tl: GSAPTimeline = gsap.timeline({
        onComplete() {
          if (cb) cb();
        },
      });

      tl.to(rdChatOverlay, {
        scale: 1,
        opacity: 1,
        ease: "power2.inOut",
        duration: 0.25,
      });
    },
  };

  function dateHandler(x: Date): string {
    const year: number = x.getFullYear();
    const month: number = x.getMonth();
    const date: number = x.getDate();
    const hours: number = x.getHours();
    const minutes: number = x.getMinutes();

    return `${date.toString().padStart(2, "0")}/${(month + 1)
      .toString()
      .padStart(2, "0")}/${year} ${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }
  function chatHandler(e?: MouseEvent): MouseEvent {
    if (e.target instanceof HTMLElement) {
      const _id: string = e.target.dataset.id;
      const chat: Chat = selectChat(_id);
      if (chat) {
        emits("open-chat", chat);
      }
    }

    return e;
  }

  watch(
    () => props.state,
    (val) => {
      if (val === "hide") animate.exit(rdPanel.value);
    }
  );
  watch(
    () => query.value,
    (val) => {
      clearTimeout(searchTimeout.value);
      searchTimeout.value = setTimeout(() => {
        loading.value = true;
        setTimeout(() => {
          animate.hide(rdChatOverlay.value, () => {
            chats.value = loadChats(val);
            setTimeout(() => {
              animate.show(rdChatOverlay.value, () => {
                loading.value = false;
              });
            }, 250);
          });
        }, 100);
      }, 250);
    }
  );

  onMounted(() => {
    animate.init(rdPanel.value);
    chats.value = loadChats();

    setTimeout(() => {
      animate.show(rdChatOverlay.value, () => {
        init.value = false;
        loading.value = false;
      });
    }, 500);
  });
</script>

<style lang="scss" scoped>
  .rd-panel {
    position: fixed;
    width: 610px;
    height: 610px;
    border: var(--border);
    border-radius: 4px;
    background: #fff;
    padding: 20px 34px;
    box-sizing: border-box;
    transform: scale(1.125);
    opacity: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .rd-panel-header {
      z-index: 2;
      position: relative;
      width: 100%;
      height: 34px;
      background: #fff;
    }
    .rd-chat-container {
      position: relative;
      width: 100%;
      height: calc(100% - 54px);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      .rd-chat {
        position: relative;
        width: 100%;
        margin: 24px 0 0 0;
        padding: 0 0 34px 0;
        display: flex;
        .rd-chat-icon-container {
          position: relative;
          width: 68px;
          height: 100%;
          padding-right: 17px;
          box-sizing: border-box;
          display: flex;
          justify-content: flex-start;
          .rd-chat-icon {
            position: relative;
            width: 34px;
            height: 34px;
            border-radius: 17px;
            padding: 0 8px;
            box-sizing: border-box;
            background: var(--primary-color);
            flex-shrink: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            span.rd-chat-letter {
              color: #fff;
            }
          }
        }
        .rd-chat-detail-container {
          position: relative;
          width: calc(100% - 68px);
          display: flex;
          flex-direction: column;
          .rd-chat-title-container {
            position: relative;
            width: 100%;
            display: flex;
            span.rd-chat-title {
              cursor: pointer;
              position: relative;
              max-width: 70%;
              line-height: 1.075;
              color: var(--primary-color);
              transition: 0.25s opacity, 0.25s transform;
              &:hover {
                opacity: 0.75;
              }
              &:active {
                opacity: 1;
                transform: scale(0.975);
              }
            }
            span.rd-chat-date {
              position: relative;
              width: 30%;
              text-align: right;
            }
          }
          .rd-chat-message-container {
            position: relative;
            width: 100%;
            margin-top: 6px;
            display: flex;
            flex-direction: column;
            span.rd-chat-participant {
              position: relative;
              width: 100%;
            }
            span.rd-chat-message {
              position: relative;
              width: 100%;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
            }
          }
          .rd-chat-bubble {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 10px;
            height: 10px;
            border-radius: 5px;
            background: var(--error-color);
          }
        }
        .rd-chat-divider {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: var(--border-color);
        }
      }
    }
    .rd-chat-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: calc(100% - 54px);
      background: #fff;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      span.rd-chat-message {
        position: relative;
        margin-top: 24px;
        line-height: 1;
        &::after {
          content: "...";
          position: absolute;
          left: calc(100% + 4px);
        }
      }
      &.rd-chat-overlay-hidden {
        opacity: 0;
      }
    }
  }
</style>
