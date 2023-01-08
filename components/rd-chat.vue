<template>
  <div class="rd-chat-container" :class="self ? 'rd-chat-container-self' : ''">
    <span
      v-if="name"
      class="rd-chat-sender rd-headline-5"
      :style="`color: ${self ? '#9b51e0' : color[0]}`"
      >{{ self ? "You" : message.from.name }}</span
    >
    <div v-if="message.reply" class="rd-chat-reply">
      <span class="rd-chat-reply-text rd-body-text">{{
        message.reply.text
      }}</span>
    </div>
    <div class="rd-chat-wrapper">
      <div
        class="rd-chat"
        ref="rdChat"
        :style="`background: ${self ? '#eedcff' : color[1]}`"
      >
        <span class="rd-chat-message rd-body-text">{{ message.text }}</span>
        <span class="rd-chat-date rd-caption-text">{{
          `${hoursHandler(new Date(message.date))}${
            message.edited ? " — Edited" : ""
          }`
        }}</span>
      </div>
      <div
        v-if="type !== 'individual' || self"
        class="rd-chat-action-button"
        @click="actionHandler"
      >
        <rd-svg
          class="rd-chat-action-icon"
          name="dots"
          style="pointer-events: none"
        />
      </div>
      <div
        ref="rdAction"
        class="rd-chat-action"
        :class="actionState === 'show' ? 'rd-chat-action-opened' : ''"
      >
        <div
          :data-action="self ? 'edit' : 'share'"
          :data-id="message._id"
          class="rd-chat-action-option"
        >
          <span class="rd-chat-action-text rd-subtitle-text">{{
            self ? "Edit" : "Share"
          }}</span>
        </div>
        <div class="rd-chat-action-divider"></div>
        <div
          :data-action="self ? 'delete' : 'reply'"
          :data-id="message._id"
          class="rd-chat-action-option"
          :class="self ? 'rd-chat-action-option-delete' : ''"
        >
          <span class="rd-chat-action-text rd-subtitle-text">{{
            self ? "Delete" : "Reply"
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import gsap from "gsap";
  import { ChatMessage } from "~~/interfaces/general";

  const emits = defineEmits(["edit", "share", "delete", "reply"]);
  const props = defineProps<{
    message: ChatMessage;
    self?: boolean;
    color?: [string, string];
    name?: boolean;
    type?: "group" | "individual";
  }>();

  const rdChat = ref<HTMLDivElement>(null);
  const rdAction = ref<HTMLDivElement>(null);

  const actionState = ref<"show" | "hide">("hide");
  const actionAnim = ref<GSAPTimeline>(null);

  function hoursHandler(x: Date): string {
    const hours: number = x.getHours();
    const minutes: number = x.getMinutes();

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }
  function actionHandler(e: MouseEvent): MouseEvent {
    if (actionState.value === "hide") {
      actionState.value = "show";
      setTimeout(() => {
        window.addEventListener("click", clickHandler);
      }, 10);
    } else actionState.value = "hide";

    return e;
  }
  function clickHandler(e: MouseEvent): MouseEvent {
    window.removeEventListener("click", clickHandler);
    if (e.target instanceof HTMLElement) {
      const action: "edit" | "share" | "delete" | "reply" = e.target.dataset
        .action as "edit" | "share" | "delete" | "reply";
      if (action) emits(action, e.target.dataset.id);
      actionState.value = "hide";
    }

    return e;
  }

  const animate = {
    openAction(rdAction: HTMLElement): GSAPTimeline {
      const tl: GSAPTimeline = gsap.timeline();

      tl.to(rdAction, {
        opacity: 1,
        scale: 1,
        ease: "power2.inOut",
        duration: 0.25,
      });

      return tl;
    },
    closeAction(rdAction: HTMLElement): GSAPTimeline {
      const tl: GSAPTimeline = gsap.timeline({
        onComplete() {
          gsap.to(rdAction, {
            scale: 1.125,
            duration: 0,
          });
        },
      });

      tl.to(rdAction, {
        opacity: 0,
        scale: 1.125,
        ease: "power2.inOut",
        duration: 0.25,
      });

      return tl;
    },
  };

  watch(
    () => actionState.value,
    (val) => {
      if (actionAnim.value?.isActive()) actionAnim.value.kill();
      if (val === "show") {
        const width: number = rdChat.value?.getBoundingClientRect?.().width;
        if (width <= 126) {
          if (props.self) {
            rdAction.value.style.left = "auto";
            rdAction.value.style.right = "0";
          } else {
            rdAction.value.style.right = "auto";
            rdAction.value.style.left = "0";
          }
        }
        actionAnim.value = animate.openAction(rdAction.value);
      } else {
        actionAnim.value = animate.closeAction(rdAction.value);
      }
    }
  );

  onBeforeUnmount(() => {
    window.removeEventListener("click", clickHandler);
  });
</script>

<style lang="scss" scoped>
  .rd-chat-container {
    position: relative;
    max-width: calc(70%);
    margin: 10px 0;
    display: flex;
    flex-direction: column;
    span.rd-chat-sender {
      position: relative;
      margin-bottom: 7px;
    }
    .rd-chat-reply {
      position: relative;
      background: var(--tersier-color);
      border-radius: 5px;
      border: 1px solid var(--background-depth-one-color);
      padding: 10px;
      box-sizing: border-box;
      margin-bottom: 7px;
      display: flex;
    }
    .rd-chat-wrapper {
      position: relative;
      display: flex;
      .rd-chat {
        position: relative;
        padding: 10px;
        border-radius: 5px;
        background: var(--chat-color);
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        span.rd-chat-date {
          position: relative;
          margin-top: 12px;
        }
      }
      .rd-chat-action-button {
        cursor: pointer;
        position: relative;
        width: 24px;
        height: 14px;
        display: flex;
        flex-shrink: 0;
        justify-content: center;
        align-items: center;
      }
      .rd-chat-action {
        pointer-events: none;
        position: absolute;
        top: 16px;
        right: 3px;
        width: 126px;
        height: 80px;
        background: #fff;
        border-radius: 5px;
        box-sizing: border-box;
        border: var(--border);
        border-color: #bdbdbd;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        opacity: 0;
        transform: scale(1.125);
        &.rd-chat-action-opened {
          pointer-events: all;
        }
        .rd-chat-action-option {
          cursor: pointer;
          position: relative;
          width: 100%;
          height: 50%;
          padding: 0 16px;
          background: rgba(0, 0, 0, 0);
          display: flex;
          align-items: center;
          transition: 0.25s background-color;
          * {
            pointer-events: none;
          }
          span.rd-chat-action-text {
            color: var(--primary-color);
          }
          &:hover {
            background: rgba(0, 0, 0, 0.05);
          }
          &:active {
            background: rgba(0, 0, 0, 0.15);
          }
          &.rd-chat-action-option-delete {
            span.rd-chat-action-text {
              color: var(--error-color);
            }
          }
        }
        .rd-chat-action-divider {
          position: absolute;
          top: calc(50% - 0.5px);
          left: 0;
          width: 100%;
          height: 1px;
          background: #bdbdbd;
        }
      }
    }
    &.rd-chat-container-self {
      align-items: flex-end;
      .rd-chat-wrapper {
        flex-direction: row-reverse;
        .rd-chat-action {
          right: auto;
          left: 3px;
        }
      }
    }
  }
</style>
